export default defineConfig({
  server: {
    allowedHosts: [
      "*"
    ],
    host: true,        // importante para Docker
    port: 4200         // ou a porta que você usa
  }
})
