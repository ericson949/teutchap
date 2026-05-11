import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { record } = await req.json()
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // 1. Get image from Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('events_photos')
      .download(record.url_original)

    if (downloadError) throw downloadError

    // 2. Call Gemini API (using fetch for Deno compatibility)
    // Note: We convert blob to base64 for Gemini
    const arrayBuffer = await fileData.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Analyze this event photo. Return a JSON object with: 'tags' (array of 4 strings), 'is_safe' (boolean), 'description' (string). Output ONLY the JSON." },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64
              }
            }
          ]
        }]
      })
    })

    const result = await response.json()
    const aiText = result.candidates[0].content.parts[0].text
    const aiJson = JSON.parse(aiText.replace(/```json|```/g, ''))

    // 3. Update database
    const { error: updateError } = await supabase
      .from('photos')
      .update({
        ai_tags: aiJson.tags || [],
        is_moderated: true,
        is_flagged: !aiJson.is_safe,
        moderation_score: aiJson.is_safe ? 0.99 : 0.1
      })
      .eq('id', record.id)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ success: true, tags: aiJson.tags }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
