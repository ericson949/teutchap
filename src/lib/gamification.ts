export type EventTypeKey =
  | 'mariage'
  | 'anniversaire'
  | 'corporate'
  | 'funerailles'
  | 'eglise'
  | 'graduation'
  | 'default'

export interface ChallengeTemplate {
  title: string
  description: string
  tone: 'fun' | 'social' | 'emotion' | 'sober' | 'team'
}

export interface GamificationBadge {
  id: string
  label: string
  description: string
  unlocked: boolean
}

export interface GamificationStats {
  ownPhotos: number
  completedChallenges: number
  receivedReactions: number
  points: number
  level: number
  levelLabel: string
  nextLevelPoints: number
  progressPercent: number
  badges: GamificationBadge[]
}

export interface ContributorRank {
  name: string
  photos: number
  completedChallenges: number
  receivedReactions: number
  points: number
}

export interface EventAward {
  id: string
  title: string
  subtitle: string
  winner: string
  score: string
}

const templates: Record<EventTypeKey, ChallengeTemplate[]> = {
  mariage: [
    { title: 'Photo avec les maries', description: 'Capturez un moment avec le couple.', tone: 'emotion' },
    { title: 'Table la plus animee', description: 'Montrez la table qui met le plus d ambiance.', tone: 'fun' },
    { title: 'Moment famille', description: 'Un souvenir tendre avec les proches.', tone: 'emotion' },
    { title: 'Danse signature', description: 'Capturez le meilleur mouvement de la piste.', tone: 'fun' }
  ],
  anniversaire: [
    { title: 'Meilleur sourire', description: 'Capturez le sourire qui illumine la soiree.', tone: 'fun' },
    { title: 'Photo du gateau', description: 'Immortalisez le moment du gateau.', tone: 'social' },
    { title: 'Selfie de groupe', description: 'Faites rentrer un maximum de personnes dans le cadre.', tone: 'fun' },
    { title: 'Ambiance de feu', description: 'Montrez le moment le plus energique.', tone: 'fun' }
  ],
  corporate: [
    { title: 'Photo d equipe', description: 'Reunissez votre equipe dans un souvenir propre.', tone: 'team' },
    { title: 'Meilleur stand', description: 'Capturez l espace le plus attractif.', tone: 'team' },
    { title: 'Networking', description: 'Un moment de connexion professionnelle.', tone: 'social' },
    { title: 'Coulisses', description: 'Montrez un moment authentique derriere la scene.', tone: 'social' }
  ],
  funerailles: [
    { title: 'Souvenir hommage', description: 'Partagez un souvenir respectueux et sobre.', tone: 'sober' },
    { title: 'Moment de recueillement', description: 'Capturez un instant calme et digne.', tone: 'sober' },
    { title: 'Presence familiale', description: 'Un souvenir discret des proches reunis.', tone: 'sober' }
  ],
  eglise: [
    { title: 'Photo de groupe', description: 'Rassemblez la communaute dans un souvenir.', tone: 'social' },
    { title: 'Moment de louange', description: 'Capturez un instant fort du programme.', tone: 'emotion' },
    { title: 'Equipe service', description: 'Mettez en lumiere ceux qui servent.', tone: 'team' }
  ],
  graduation: [
    { title: 'Photo avec le diplome', description: 'Le moment officiel a garder.', tone: 'emotion' },
    { title: 'Famille fiere', description: 'Capturez les proches autour du diplome.', tone: 'emotion' },
    { title: 'Promotion reunie', description: 'Une photo avec les camarades.', tone: 'social' }
  ],
  default: [
    { title: 'Premier souvenir', description: 'Ajoutez la premiere photo forte de l evenement.', tone: 'social' },
    { title: 'Photo de groupe', description: 'Reunissez plusieurs invites dans le cadre.', tone: 'social' },
    { title: 'Moment emotion', description: 'Capturez un instant que l organisateur voudra revoir.', tone: 'emotion' }
  ]
}

const levelThresholds = [0, 30, 80, 150, 250]
const levelLabels = ['Invite actif', 'Contributeur', 'Reporter', 'Photographe VIP', 'Legende photo']

export function normalizeEventType(eventType?: string): EventTypeKey {
  const normalized = (eventType || '').toLowerCase()
  if (normalized.includes('mariage')) return 'mariage'
  if (normalized.includes('anniv')) return 'anniversaire'
  if (normalized.includes('corporate') || normalized.includes('entreprise')) return 'corporate'
  if (normalized.includes('funer') || normalized.includes('hommage')) return 'funerailles'
  if (normalized.includes('eglise') || normalized.includes('relig')) return 'eglise'
  if (normalized.includes('dipl') || normalized.includes('gradu')) return 'graduation'
  return 'default'
}

export function getChallengeTemplates(eventType?: string): ChallengeTemplate[] {
  return templates[normalizeEventType(eventType)]
}

export function getGamificationStats(
  photos: any[],
  reactions: Record<string, Record<string, number>>,
  guestPseudo?: string
): GamificationStats {
  const pseudo = (guestPseudo || '').trim().toLowerCase()
  const ownPhotos = pseudo
    ? photos.filter((photo) => {
        const author = (photo.uploader_name || photo.contributor_name || '').toLowerCase()
        return author === pseudo
      })
    : []

  const completedChallenges = new Set(
    ownPhotos.filter((photo) => photo.challenge_id).map((photo) => photo.challenge_id)
  ).size

  const receivedReactions = ownPhotos.reduce((sum, photo) => {
    const photoReactions = reactions[photo.id] || {}
    return sum + Object.values(photoReactions).reduce((reactionSum, count) => reactionSum + count, 0)
  }, 0)

  const points = ownPhotos.length * 10 + completedChallenges * 25 + receivedReactions * 5
  const level = Math.min(
    levelThresholds.length,
    levelThresholds.filter((threshold) => points >= threshold).length
  )
  const currentThreshold = levelThresholds[Math.max(0, level - 1)] || 0
  const nextLevelPoints = levelThresholds[level] || levelThresholds[levelThresholds.length - 1]
  const progressSpan = Math.max(1, nextLevelPoints - currentThreshold)
  const progressPercent = level >= levelThresholds.length
    ? 100
    : Math.min(100, Math.round(((points - currentThreshold) / progressSpan) * 100))

  const badges: GamificationBadge[] = [
    {
      id: 'first-memory',
      label: 'Premier souvenir',
      description: 'Ajouter au moins une photo.',
      unlocked: ownPhotos.length >= 1
    },
    {
      id: 'contributor',
      label: 'Contributeur',
      description: 'Ajouter 3 photos.',
      unlocked: ownPhotos.length >= 3
    },
    {
      id: 'challenge-maker',
      label: 'Mission accomplie',
      description: 'Completer un defi photo.',
      unlocked: completedChallenges >= 1
    },
    {
      id: 'crowd-favorite',
      label: 'Coup de coeur',
      description: 'Recevoir 5 reactions.',
      unlocked: receivedReactions >= 5
    },
    {
      id: 'vip-photographer',
      label: 'Photographe VIP',
      description: 'Atteindre 10 photos.',
      unlocked: ownPhotos.length >= 10
    }
  ]

  return {
    ownPhotos: ownPhotos.length,
    completedChallenges,
    receivedReactions,
    points,
    level,
    levelLabel: levelLabels[Math.max(0, level - 1)] || levelLabels[0],
    nextLevelPoints,
    progressPercent,
    badges
  }
}

export function getPhotoLeaderboard(photos: any[], reactions: Record<string, Record<string, number>>) {
  return [...photos]
    .map((photo) => ({
      ...photo,
      reactionTotal: Object.values(reactions[photo.id] || {}).reduce((sum, count) => sum + count, 0)
    }))
    .sort((a, b) => b.reactionTotal - a.reactionTotal)
    .slice(0, 3)
}

export function isSoberEvent(eventType?: string, gamificationMode?: string): boolean {
  if (gamificationMode === 'sober') return true
  if (gamificationMode === 'party') return false
  return normalizeEventType(eventType) === 'funerailles'
}

export function isGamificationEnabled(gamificationMode?: string): boolean {
  return gamificationMode !== 'off'
}

export function getContributorLeaderboard(
  photos: any[],
  reactions: Record<string, Record<string, number>>,
  limit = 5
): ContributorRank[] {
  const contributorMap: Record<string, ContributorRank & { challengeIds: Set<string> }> = {}

  photos.forEach((photo) => {
    const name = (photo.uploader_name || photo.contributor_name || 'Invite').trim()
    if (!contributorMap[name]) {
      contributorMap[name] = {
        name,
        photos: 0,
        completedChallenges: 0,
        receivedReactions: 0,
        points: 0,
        challengeIds: new Set<string>()
      }
    }

    const rank = contributorMap[name]
    rank.photos += 1
    if (photo.challenge_id) rank.challengeIds.add(photo.challenge_id)
    rank.receivedReactions += Object.values(reactions[photo.id] || {}).reduce((sum, count) => sum + count, 0)
  })

  return Object.values(contributorMap)
    .map((rank) => ({
      name: rank.name,
      photos: rank.photos,
      completedChallenges: rank.challengeIds.size,
      receivedReactions: rank.receivedReactions,
      points: rank.photos * 10 + rank.challengeIds.size * 25 + rank.receivedReactions * 5
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, limit)
}

export function getEventAwards(
  photos: any[],
  reactions: Record<string, Record<string, number>>,
  challenges: any[] = []
): EventAward[] {
  const topPhoto = getPhotoLeaderboard(photos, reactions)[0]
  const topContributor = getContributorLeaderboard(photos, reactions, 1)[0]
  const challengeCounts = challenges
    .map((challenge) => ({
      challenge,
      count: photos.filter((photo) => photo.challenge_id === challenge.id).length
    }))
    .sort((a, b) => b.count - a.count)

  const awards: EventAward[] = []

  if (topPhoto) {
    awards.push({
      id: 'photo-of-the-event',
      title: 'Photo de l evenement',
      subtitle: 'La photo la plus aimee',
      winner: topPhoto.uploader_name || topPhoto.contributor_name || 'Invite',
      score: `${topPhoto.reactionTotal} reaction(s)`
    })
  }

  if (topContributor) {
    awards.push({
      id: 'best-contributor',
      title: 'Meilleur contributeur',
      subtitle: 'Participation globale',
      winner: topContributor.name,
      score: `${topContributor.points} points`
    })
  }

  if (challengeCounts[0] && challengeCounts[0].count > 0) {
    awards.push({
      id: 'best-challenge',
      title: 'Defi star',
      subtitle: challengeCounts[0].challenge.title,
      winner: 'Communaute',
      score: `${challengeCounts[0].count} photo(s)`
    })
  }

  return awards
}
