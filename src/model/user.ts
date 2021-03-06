import { Entity, Reference, UUID, generateUUID, ValidationError } from './base'
import { Post, Visibility } from './post'
import { Session } from './session'

export class UserRef implements Reference {
  readonly type = 'UserRef' as const
  constructor(readonly id: UUID) {}
}

export class User implements Entity {
  readonly type = 'User' as const
  readonly id: UUID
  readonly handle: string
  readonly name: string | null
  readonly hashedPassword: string
  readonly iconUrl: string | null
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor({
    id,
    handle,
    name,
    hashedPassword,
    iconUrl,
    createdAt,
    updatedAt,
  }: {
    id: UUID
    handle: string
    name: string | null
    hashedPassword: string
    iconUrl: string | null
    createdAt: Date
    updatedAt: Date
  }) {
    this.id = id
    this.handle = validateHandleName(handle)
    this.name = validateName(name)
    this.hashedPassword = hashedPassword
    this.iconUrl = iconUrl
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  get ref(): UserRef {
    return new UserRef(this.id)
  }

  static create({
    id,
    handle,
    name,
    hashedPassword,
    iconUrl,
  }: {
    id?: UUID
    handle: string
    name?: string | null
    hashedPassword: string
    iconUrl?: string | null
  }): User {
    return new User({
      id: id || generateUUID(),
      handle,
      name: name || null,
      hashedPassword,
      iconUrl: iconUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  update(patch: { name?: string; iconUrl?: string }): User {
    return new User({
      ...this,
      name: patch.name || this.name,
      iconUrl: patch.iconUrl || this.iconUrl,
      updatedAt: new Date(),
    })
  }

  createPost({ id, text, visibility }: { id?: UUID; text: string; visibility?: Visibility }): Post {
    return new Post({
      id: id || generateUUID(),
      author: this.ref,
      createdAt: new Date(),
      text,
      visibility: visibility || 'public',
    })
  }

  createSession({ id, client }: { id?: UUID; client: string }): Session {
    return new Session({
      id: id || generateUUID(),
      user: this.ref,
      client,
      createdAt: new Date(),
    })
  }
}

function validateHandleName(handle: string): string {
  if (!/^[a-z0-9\-]*$/.test(handle)) throw new ValidationError('Each "handle" characters must be a-z, 0-9, and "-"')
  const length = handle.length
  if (length < 3 || 16 < length)
    throw new ValidationError('"handle" must be at least 3 characters and not more than 16 characters')
  return handle
}

function validateName(name: string | null): string | null {
  if (name == null) return name
  return name
}
