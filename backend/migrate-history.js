import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const migrateHistory = async () => {
    try {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        const usersCollection = mongoose.connection.db.collection("users");
        const users = await usersCollection.find({}).toArray();

        console.log(`Found ${users.length} users to inspect.`);
        let migratedCount = 0;

        for (const user of users) {
            let needsUpdate = false;
            let updatedHistory = [];

            if (typeof user.history === "string") {
                needsUpdate = true;
                updatedHistory = [
                    {
                        sessionId: new mongoose.Types.ObjectId().toString(),
                        title: user.history.slice(0, 32),
                        startedAt: user.createdAt || new Date(),
                        messages: [
                            {
                                role: "user",
                                content: user.history,
                                type: "general",
                                urls: [],
                                timestamp: user.createdAt || new Date(),
                            },
                        ],
                        createdAt: user.createdAt || new Date(),
                        updatedAt: new Date(),
                    },
                ];
            } else if (Array.isArray(user.history)) {
                updatedHistory = user.history.map((item) => {
                    if (typeof item === "string") {
                        needsUpdate = true;
                        return {
                            sessionId: new mongoose.Types.ObjectId().toString(),
                            title: item.slice(0, 32),
                            startedAt: user.createdAt || new Date(),
                            messages: [
                                {
                                    role: "user",
                                    content: item,
                                    type: "general",
                                    urls: [],
                                    timestamp: user.createdAt || new Date(),
                                },
                            ],
                            createdAt: user.createdAt || new Date(),
                            updatedAt: new Date(),
                        };
                    }
                    return item;
                });
            } else if (!user.history) {
                needsUpdate = true;
                updatedHistory = [];
            }

            if (needsUpdate) {
                await usersCollection.updateOne(
                    { _id: user._id },
                    { $set: { history: updatedHistory } }
                );
                console.log(`Migrated user: ${user.email} (${user._id})`);
                migratedCount++;
            }
        }

        console.log(`Migration complete. Updated ${migratedCount} of ${users.length} users.`);
    } catch (error) {
        console.error("Migration error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
};

migrateHistory();

