/**
  * @typedef { 'lecture' | 'courseOutline' | 'pastQuestion' | 'areaOfConcentration' } MaterialCategoryType
  * @typedef { 'image' | 'docx' | 'pdf' | 'audio' | 'slides' } MaterialTypeType
  * @typedef { 'cloudinary' | 'firebase' } StorageProviderType
  * @typedef { 'pending' | 'processing' | 'completed' | 'failed' } AiPipelineStatusType
 */

/**
 * @typedef {Object} AiPipeline
 * @property {AiPipelineStatusType|null} status
 * @property {string|null} aiSummary
 * @property {string|null} processedText
 */

/**
 * @typedef {Object} Material
 * @property {string} id
 * @property {MaterialCategoryType} category
 * @property {MaterialTypeType} type
 * @property {string[]} fileUrls
 * @property {string[]} publicIds
 * @property {StorageProviderType} [storageProvider]
 * @property {string|null} topic
 * @property {string|null} lecturer
 * @property {string|null} [year]
 * @property {string} extraInfo
 * @property {string|null} [relatedMaterialId]
 * @property {AiPipeline} aiPipeline
 * @property {import('firebase-admin/firestore').Timestamp} uploadedAt
 */

export {}