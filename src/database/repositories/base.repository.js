import { db } from "#database/firebase.js";
import handleFirestoreError from './firestore.errors.js'

class BaseRepository {
    constructor (pathSegments, converter, toUpdate) {
        this.pathSegments = pathSegments
        this.converter = converter
        this.toUpdate = toUpdate
    }

    _collectionPath (parentIds = []) {
        let path = this.pathSegments[0]
        
        for (let i = 1; i < this.pathSegments.length; i++) {
            path += `/${parentIds[i - 1]}/${this.pathSegments[i]}`
        }
        return path
    }

    _collection (parentIds = []) {
        return db.collection(this._collectionPath(parentIds)).withConverter(this.converter)
    }

    async findById (parentIds, id) {
        try {
            const doc = await this._collection(parentIds).doc(id).get()
            return doc.exists ? doc.data() : null
        } catch (error) {
            handleFirestoreError(error)
        }
    }

    async list (parentIds) {
        try {
            const snap = await this._collection(parentIds).get()
            return snap.docs.map((d) => d.data)
        } catch (error) {
            handleFirestoreError(error)
        }
    }

    async create (parentIds, id, data) {
        try {
            const ref = id ? this._collection(parentIds).doc(id) : this._collection(parentIds).doc()
            await ref.set(data)
            return this.findById(parentIds, ref.id)
        } catch (error) {
            handleFirestoreError(error)
        }
    }

    async update (parentIds, id, partialData) {
        try {
            const shaped = this.toUpdate(partialData)
            await this._collection(parentIds).doc(id).update(shaped)
            return this.findById(parentIds, id)
        } catch (error) {
            handleFirestoreError(error)
        }
    }

    async delete (parentIds, id) {
        try {
            await this._collection(parentIds).doc(id).delete()
        } catch (error) {
            handleFirestoreError(error)
        }
    }

    async findWhere (parentIds, field, op, value) {
        try {
            const snap = await this._collection(parentIds).where(field, op, value).get()
            return snap.docs.map((d) => d.data())
        } catch (error) {
            handleFirestoreError(error)
        }
    }

    rawRef (parentIds, id) {
        return db.doc(`${this._collectionPath(parentIds)}/${id}`)
    }
}

export default BaseRepository