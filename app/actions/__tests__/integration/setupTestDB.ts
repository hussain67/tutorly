import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo = await MongoMemoryServer.create({
	binary: {
		version: "6.0.13"
	}
});
let setupPromise: Promise<void> | null = null;

/**
 * Setup MongoDB Memory Server for testing
 * Uses a singleton pattern with proper locking
 */
export async function setupTestDB() {
	// Return existing setup promise to avoid race conditions
	if (setupPromise) {
		return setupPromise;
	}

	setupPromise = (async () => {
		try {
			// Check if already connected
			if (mongoose.connection.readyState === 1) {
				return;
			}

			// Create MongoDB Memory Server instance
			if (!mongo) {
				mongo = await MongoMemoryServer.create({
					instance: {
						storageEngine: "ephemeralForTest"
					}
				});
			}

			const mongoUri = mongo.getUri();
			process.env.MONGO_URI = mongoUri;

			// Connect mongoose
			if (mongoose.connection.readyState === 0) {
				await mongoose.connect(mongoUri, {
					bufferCommands: false,
					serverSelectionTimeoutMS: 10000
				});
			}
		} catch (error) {
			setupPromise = null;
			throw error;
		}
	})();

	return setupPromise;
}

/**
 * Fast cleanup between tests
 * Clears collections without dropping database
 */
export async function clearTestDB() {
	if (mongoose.connection.readyState !== 1) {
		return;
	}

	try {
		// Get fresh collection references
		const db = mongoose.connection;
		const collections = db.collections;

		// Clear each collection
		for (const collectionName of Object.keys(collections)) {
			try {
				await collections[collectionName].deleteMany({});
			} catch (error) {
				// Ignore errors for non-existent collections
				if (error instanceof Error && !error.message.includes("ns not found") && !error.message.includes("dropped")) {
					console.error(`Error clearing ${collectionName}:`, error.message);
				}
			}
		}
	} catch (error) {
		console.error("Error clearing test database:", error);
	}
}

/**
 * Final cleanup after all tests
 */
export async function teardownTestDB() {
	try {
		// Clear setup promise
		setupPromise = null;

		// Disconnect mongoose
		if (mongoose.connection.readyState !== 0) {
			try {
				await mongoose.disconnect();
			} catch (error) {
				console.error("Error disconnecting mongoose:", error);
			}
		}

		// Wait a bit before stopping mongo to ensure clean shutdown
		await new Promise(resolve => setTimeout(resolve, 1000));

		// Stop MongoDB Memory Server
		if (mongo) {
			try {
				await mongo.stop({ force: true });
			} catch (error) {
				console.error("Error stopping MongoDB Memory Server:", error);
			} finally {
				mongo = null;
			}
		}
	} catch (error) {
		console.error("Error during teardown:", error);
	}
}
