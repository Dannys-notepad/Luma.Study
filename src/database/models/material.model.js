import { FieldValue } from '#database/firebase.js';

const materialConverter = {
    toFirestore (m) {
        return {
            category: m.category,
            type: m.type,
            fileUrls: m.fileUrls ?? [],
            publicIds: m.publicIds ?? [],
            topic: m.topic,
            lecturer: m.lecturer,
            year: m.year ?? null,
            extraInfo: m.extraInfo ?? '',
            relatedMaterialId: m.relatedMaterialId ?? null,
            aiPipeline: {
                status: m.status ?? null,
                aiSummary: m.aiSummary ?? null,
                processedText: m.processedText ?? null,
            },
            uploadedAt: FieldValue.serverTimestamp()
        }
    },

    fromFirestore (snapshot) {
        return {
            id: snapshot.id,
            ...snapshot.data()
        }
    }
}

const ALLOWED = ['category', 'type', 'fileUrls', 'publicUrls', 'topic', 'lecturer', 'year', 'extrainfo', 'relatedMaterialId', /*'aiSummary', 'processedText'*/ 'aiBox']

const materialToUpdate = (partial) => {
    const shaped = {}
    for (const key of ALLOWED) if (partial[key] !== undefined) shaped[key] = partial[key]
    return shaped
}


export {
    materialToUpdate,
    materialConverter
}