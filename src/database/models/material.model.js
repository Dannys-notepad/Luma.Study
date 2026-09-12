import { FieldValue } from '#database/firebase.js';

const materialConverter = {
    toFirestore (m) {
        return {
            category: m.category,
            type: m.type,
            fileUrls: m.fileUrls ?? [],
            publicIds: m.publicIds ?? [],
            //storageProvider: m.storageProvider,

            topic: m.topic,
            lecturer: m.lecturer,
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
        return {
            ...snapshot.data(),
            id: snapshot.id
        }
    }
}

const ALLOWED_TOP = [
    'category', 'type', 'fileUrls', 'publicIds',
    
    'topic', 'lecturer', 'year', 'extraInfo', 'relatedMaterialId',
]

const ALLOWED_AI_PIPELINE = [ 'status', 'aiSummary', 'processedText' ]

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