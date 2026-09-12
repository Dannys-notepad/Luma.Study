import { FieldValue } from '#database/firebase.js';
import { StorageProvider } from '#constants/model.constant.js'

/**
 * @type {import('firebase-admin/firestore').FirestoreDataConverter<import('#types/material.type.js').Material>}
 */
const materialConverter = {
    toFirestore (m) {
        return {
            category: m.category,
            type: m.type,
            fileUrls: m.fileUrls ?? [],
            publicIds: m.publicIds ?? [],
            storageProvider: m.storageProvider ?? StorageProvider.CLOUDINARY,

            topic: m.topic ?? null,
            lecturer: m.lecturer ?? null,
            year: m.year ?? null,
            extraInfo: m.extraInfo ?? '',
            relatedMaterialId: m.relatedMaterialId ?? null,

            aiPipeline: {
                status: m.aiPipeline?.status ?? m.status ?? null,
                aiSummary: m.aiPipeline?.aiSummary ?? m.aiSummary ?? null,
                processedText: m.aiPipeline?.processedText ?? m.processedText ?? null,
            },
            uploadedAt: FieldValue.serverTimestamp()
        }
    },

    fromFirestore (snapshot) {
        const data = snapshot.data()
        return {
            ...data,
            id: snapshot.id
        }
    }
}

const ALLOWED_TOP = [
    'category', 'type', 'fileUrls', 'publicIds', 'storageProvider',
    'topic', 'lecturer', 'year', 'extraInfo', 'relatedMaterialId',
]

const ALLOWED_AI_PIPELINE = [ 'status', 'aiSummary', 'processedText' ]

/**
 * Shapes partial material payload for update.
 * @param {Partial<import('#types/material.type.js').Material>} partial
 * @returns {Record<string, any>}
 */
const materialToUpdate = (partial) => {
    const shaped = {}

    for (const key of ALLOWED_TOP) {
        if (partial[key] !== undefined) {
            shaped[key] = partial[key]
        }
    }

    if (partial.aiPipeline) {
        for (const key of ALLOWED_AI_PIPELINE) {
            if (partial.aiPipeline[key] !== undefined) {
                shaped[`aiPipeline.${key}`] = partial.aiPipeline[key]
            }
        }
    }
    
    return shaped
}

export {
    materialToUpdate,
    materialConverter
}