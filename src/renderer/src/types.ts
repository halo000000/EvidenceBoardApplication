export type InteractionMode = 'standard' | 'manipulation'
export type EvidenceObjectType = 'image' | 'text' | 'person' | 'location'

export interface Position {
  x: number
  y: number
}

export interface ConnectionPoint {
  id: string
  x: number
  y: number
}

export interface Connection {
  id: string
  fromObjectId: string
  fromPointId: string
  toObjectId: string
  toPointId: string
}

export interface BaseEvidenceObject {
  id: string
  type: EvidenceObjectType
  position: Position
  width: number
  height: number
}

export interface ImageObject extends BaseEvidenceObject {
  type: 'image'
  imageData: string
  title?: string
}

export interface TextObject extends BaseEvidenceObject {
  type: 'text'
  text: string
}

export interface PersonObject extends BaseEvidenceObject {
  type: 'person'
  profilePhoto?: string
  name: string
  age?: number
  jobTitle?: string
  maritalStatus?: string
  gender?: string
  bloodType?: string
  physicalHeight?: string
  physicalWeight?: string
  notes?: string
}

export interface LocationObject extends BaseEvidenceObject {
  type: 'location'
  address: string
  googleMapsUrl?: string
}

export type EvidenceObject = ImageObject | TextObject | PersonObject | LocationObject

export interface BoardState {
  objects: EvidenceObject[]
  connections: Connection[]
  images: Record<string, string>
}
