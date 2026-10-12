console.log("Partenza script");

const { Client } = require("pg");

const client = new Client({
    host: "localhost",
    port: 5432,
    database: "smartmenu",
    user: "postgres",
    password: "Epson123!"
});

async function testConnessione() {
    console.log("Tentativo connessione...");

    try {
        await client.connect();

        console.log("✅ Database connesso!");

        const result = await client.query("SELECT * FROM utente");

        console.log(result.rows);

        await client.end();

    } catch (err) {
        console.error("❌ Errore:");
        console.error(err);
    }
}

testConnessione();