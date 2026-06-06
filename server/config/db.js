import mongoose from 'mongoose';
import dns from 'dns';

// ─── Override broken system DNS ──────────────────────────────────────────────
// The system DNS resolver (127.0.0.1) is not functioning — all DNS queries
// including A records and SRV records return ECONNREFUSED.
// This overrides it at the Node.js level before any MongoDB connection attempt.
// Using Google (8.8.8.8) + Cloudflare (1.1.1.1) as reliable public resolvers.
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);


const connectWithUri = async (uri, label) => {
    const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
    console.log(`🔌 [${label}] Connecting to: ${maskedUri}`);
    return mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        family: 4, // Force IPv4 — avoids SRV resolution failures
    });
};

const connectDB = async () => {
    try {
        const dbUri = process.env.NODE_ENV === 'test'
            ? process.env.MONGODB_URI_TEST
            : (process.env.MONGO_URI || process.env.DATABASE_URL || process.env.MONGODB_URI);

        if (!dbUri) {
            console.error('❌ Environment Variable check failed:');
            console.error('Available keys:', Object.keys(process.env).filter(key => key.includes('URI') || key.includes('URL') || key.includes('MONGO')));
            throw new Error(`Database URI not found for ${process.env.NODE_ENV || 'development'} environment`);
        }

        let conn;
        try {
            conn = await connectWithUri(dbUri, 'SRV');
        } catch (primaryErr) {
            const isDnsError = primaryErr.message.includes('querySrv') ||
                               primaryErr.message.includes('ECONNREFUSED') ||
                               primaryErr.message.includes('ETIMEOUT');

            // If DNS/SRV failed and a direct URI fallback is configured, try it
            const directUri = process.env.MONGO_URI_DIRECT;
            if (isDnsError && directUri) {
                console.warn(`⚠️  SRV lookup failed (DNS issue). Retrying with direct URI...`);
                conn = await connectWithUri(directUri, 'Direct');
            } else {
                throw primaryErr; // Re-throw so the outer catch handles it
            }
        }

        if (process.env.NODE_ENV !== 'test') {
            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        }
    } catch (error) {
        console.error(`❌ MongoDB connection failed`);
        console.error(`   Code   : ${error.code || 'N/A'}`);
        console.error(`   Message: ${error.message}`);
        if (error.message.includes('querySrv') || error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEOUT')) {
            console.error(`\n⚠️  DNS/SRV Resolution Issue Detected!`);
            console.error(`   Your network cannot resolve MongoDB Atlas SRV records.`);
            console.error(`   Fix options:`);
            console.error(`   1. Switch your DNS to 8.8.8.8 (Google) or 1.1.1.1 (Cloudflare)`);
            console.error(`   2. Set MONGO_URI_DIRECT in .env to a standard mongodb:// connection string`);
            console.error(`      (Get it from Atlas → Connect → Drivers → Standard connection string)`);
        }
        if (error.message.includes('Authentication') || error.message.includes('auth')) {
            console.error(`\n⚠️  Authentication Failed — check MONGO_URI password in .env`);
        }
        console.error(`\nℹ️  Server continues running, but DB operations will fail until connection is fixed.`);
        // Don't exit — server stays alive so health check routes still respond
        // process.exit(1);
    }
};

export default connectDB;
