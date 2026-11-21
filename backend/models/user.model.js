import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            default: "general",
        },
        urls: [
            {
                type: String,
            },
        ],
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const sessionSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            default: () => new mongoose.Types.ObjectId().toString(),
        },
        title: {
            type: String,
            default: "New Transmission",
        },
        startedAt: {
            type: Date,
            default: Date.now,
        },
        messages: [messageSchema],
    },
    { timestamps: true }
);

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 50,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: /.+\@.+\..+/,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        assistantName: {
            type: String,
        },
        assistantImage: {
            type: String,
        },
        assistantGender: {
            type: String,
            enum: ["female", "male"],
            default: "female",
        },
        history: [sessionSchema],
    },
    { timestamps: true }
);

// Backward compatibility & self-healing migration hook:
// Automatically intercepts legacy raw documents from MongoDB Atlas where history
// was stored as an array of primitive strings (e.g. ["hello"]) or a primitive string,
// and normalizes them into structured session subdocuments before Mongoose casts them.
userSchema.pre("init", function (rawDoc) {
    if (!rawDoc) return;

    if (typeof rawDoc.history === "string") {
        rawDoc.history = [
            {
                sessionId: new mongoose.Types.ObjectId().toString(),
                title: rawDoc.history.slice(0, 32),
                startedAt: rawDoc.createdAt || new Date(),
                messages: [
                    {
                        role: "user",
                        content: rawDoc.history,
                        type: "general",
                        urls: [],
                        timestamp: rawDoc.createdAt || new Date(),
                    },
                ],
            },
        ];
    } else if (Array.isArray(rawDoc.history)) {
        rawDoc.history = rawDoc.history.map((item) => {
            if (typeof item === "string") {
                return {
                    sessionId: new mongoose.Types.ObjectId().toString(),
                    title: item.slice(0, 32),
                    startedAt: rawDoc.createdAt || new Date(),
                    messages: [
                        {
                            role: "user",
                            content: item,
                            type: "general",
                            urls: [],
                            timestamp: rawDoc.createdAt || new Date(),
                        },
                    ],
                };
            }
            return item;
        });
    } else if (!rawDoc.history) {
        rawDoc.history = [];
    }
});

userSchema.pre("validate", function () {
    if (typeof this.history === "string") {
        this.history = [];
    } else if (Array.isArray(this.history)) {
        // Defensive filter to ensure all entries are objects
        this.history = this.history.filter((item) => item && typeof item === "object");
    } else if (!this.history) {
        this.history = [];
    }
});

const User = mongoose.model("user", userSchema);

export default User;
