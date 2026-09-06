import app from '#app.js'
import env from '#config/env.js'

const PORT = env.PORT

app.listen(PORT, () => console.log(`Luma.Study server up and running on port ${PORT}`))