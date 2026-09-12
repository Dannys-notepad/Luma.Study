import { describe, it, expect, beforeEach } from 'vitest'
import { materialRepository } from '#database/repositories/index.js'
import env from '#config/env.js'

const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

describe('materialRepository', () => {
    beforeEach(() => {
       if (env.NODE_ENV !== 'development' && !env.FIREBASE_CLIENT_EMAIL) {
            throw new Error('To run tests, this project must be in development environment, and NODE_ENV set to "development" and FIRESTORE_EMULATOR_HOS set to "127.0.0.1:8081"')
        }
    })

    it('creates and finds a material by id', async () => {
        const userId = makeId('user')
        const courseId = makeId('course')
        const materialId = makeId('material')

        const data = {
            category: 'Lecture Notes',
            type: 'pdf',
            fileUrls: ['https://example.com/note.pdf'],
            publicIds: ['public-123'],
            topic: 'Arrays',
            lecturer: 'Dr. Smith',
            year: 2024,
            extraInfo: 'Introductory notes',
            relatedMaterialId: null,
            aiPipeline: {
                status: 'completed',
                aiSummary: 'This covers arrays and indexing.',
                processedText: 'Array indexing is ...'
            }
        }

        await materialRepository.create(userId, courseId, materialId, data)

        const found = await materialRepository.findById(userId, courseId, materialId)

        expect(found).not.toBeNull()
        expect(found.id).toBe(materialId)
        expect(found.category).toBe(data.category)
        expect(found.topic).toBe(data.topic)
        expect(found.aiPipeline.status).toBe('completed')
    })

    it('lists materials in a course', async () => {
        const userId = makeId('user')
        const courseId = makeId('course')
        const materialId1 = makeId('material')
        const materialId2 = makeId('material')

        await materialRepository.create(userId, courseId, materialId1, {
            category: 'Past Questions',
            type: 'pdf',
            fileUrls: ['https://example.com/q1.pdf'],
            publicIds: ['q1'],
            topic: 'Midsem',
            lecturer: 'Dr. Johnson',
            year: 2023,
            extraInfo: '',
            relatedMaterialId: null,
            aiPipeline: { status: null, aiSummary: null, processedText: null }
        })

        await materialRepository.create(userId, courseId, materialId2, {
            category: 'Lecture Notes',
            type: 'pdf',
            fileUrls: ['https://example.com/ln.pdf'],
            publicIds: ['ln'],
            topic: 'Graphs',
            lecturer: 'Dr. Johnson',
            year: 2024,
            extraInfo: 'Graph theory',
            relatedMaterialId: null,
            aiPipeline: { status: null, aiSummary: null, processedText: null }
        })

        const items = await materialRepository.list(userId, courseId)

        expect(Array.isArray(items)).toBe(true)
        expect(items.some((m) => m.id === materialId1)).toBe(true)
        expect(items.some((m) => m.id === materialId2)).toBe(true)
    })

    it('finds materials by category', async () => {
        const userId = makeId('user')
        const courseId = makeId('course')
        const materialId = makeId('material')

        await materialRepository.create(userId, courseId, materialId, {
            category: 'Tutorials',
            type: 'pdf',
            fileUrls: ['https://example.com/tutorial.pdf'],
            publicIds: ['tut'],
            topic: 'Recursion',
            lecturer: 'Dr. Ahmed',
            year: 2024,
            extraInfo: '',
            relatedMaterialId: null,
            aiPipeline: { status: null, aiSummary: null, processedText: null }
        })

        const byCategory = await materialRepository.findByCategory(userId, courseId, 'Tutorials')

        expect(Array.isArray(byCategory)).toBe(true)
        expect(byCategory.some((m) => m.id === materialId)).toBe(true)
    })

    it('updates a material', async () => {
        const userId = makeId('user')
        const courseId = makeId('course')
        const materialId = makeId('material')

        await materialRepository.create(userId, courseId, materialId, {
            category: 'Lecture Notes',
            type: 'pdf',
            fileUrls: ['https://example.com/old.pdf'],
            publicIds: ['old'],
            topic: 'Old Topic',
            lecturer: 'Old Lecturer',
            year: 2022,
            extraInfo: 'Old notes',
            relatedMaterialId: null,
            aiPipeline: { status: null, aiSummary: null, processedText: null }
        })

        const updated = await materialRepository.update(userId, courseId, materialId, {
            topic: 'New Topic',
            lecturer: 'New Lecturer',
            aiPipeline: {
                status: 'processed',
                aiSummary: 'New summary'
            }
        })

        expect(updated).not.toBeNull()
        expect(updated.topic).toBe('New Topic')
        expect(updated.lecturer).toBe('New Lecturer')

        const found = await materialRepository.findById(userId, courseId, materialId)
        expect(found.topic).toBe('New Topic')
        expect(found.aiPipeline.status).toBe('processed')
    })

    it('deletes a material', async () => {
        const userId = makeId('user')
        const courseId = makeId('course')
        const materialId = makeId('material')

        await materialRepository.create(userId, courseId, materialId, {
            category: 'Assignments',
            type: 'zip',
            fileUrls: ['https://example.com/assignment.zip'],
            publicIds: ['assign'],
            topic: 'Project',
            lecturer: 'Dr. Onu',
            year: 2024,
            extraInfo: '',
            relatedMaterialId: null,
            aiPipeline: { status: null, aiSummary: null, processedText: null }
        })

        await materialRepository.delete(userId, courseId, materialId)

        const found = await materialRepository.findById(userId, courseId, materialId)
        expect(found).toBeNull()
    })
})