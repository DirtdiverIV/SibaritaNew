import PocketBase from 'pocketbase'

// En modo local, PocketBase corre en http://127.0.0.1:8090
const pb = new PocketBase('http://127.0.0.1:8090')

export default pb
