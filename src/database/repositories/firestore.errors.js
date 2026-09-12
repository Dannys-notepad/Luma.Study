import AppError from "#lib/AppError.lib.js";

const handleFirestoreError = (err) => {
    if (err instanceof AppError) throw err
    const code = err?.code
    if (code === 5 || code === 'not-found' || code === 'NOT_FOUND') throw AppError.notFound('Document not found')
    if (code === 6 || code === 'already-exists' || code === 'ALREADY_EXISTS') throw AppError.conflict('Document already exists')
    if (code === 7 || code === 'permission-denied' || code === 'PERMISSION_DENIED') throw AppError.forbidden('Permission denied')
    if (code === 16 || code === 'unauthenticated' || code === 'UNAUTHENTICATED') throw AppError.unauthorized('Unauthenticated')
    throw AppError.server(err?.message || 'Database error', err)
}

export default handleFirestoreError