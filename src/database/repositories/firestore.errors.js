import AppError from "#lib/AppError.lib.js";

const handleFirestoreError = (err) => {
    if (err.code === 5 || err.code === 'not-found') throw new AppError.notFound('Document not found')
    if (err.code === 6 || err.code === 'already-exists') throw new AppError.confilct('Document already exists')
    if (err.code === 'permission-denied') throw new AppError.unauthorized('Document not found')
    throw new AppError.server(err.message || 'Database error')
}

export default handleFirestoreError