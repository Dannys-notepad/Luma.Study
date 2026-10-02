import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '#config/cloudinary.js'


const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'Luma.Study/materials',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 2000, height: 2000, crop: 'limit' }]
    }
})

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp']

    if(allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Only JPEG, PNG, JPG, WEBP images are allowed'))
    }
}

// await Promise.all(
//     reportError.rawPhotoPublicIds.map(id => cloudinary.uploader.destroy(id))
// )

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
})