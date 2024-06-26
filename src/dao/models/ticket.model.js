import mongoose from "mongoose";

const ticketsCollection = "tickets";

const ticketSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, max: 100 },
        purchaseDateTime: { type: Date, default: Date.now, required: true },
        amount: { type: Number, required: true },
        purchaser:{ type: String, required: true, max: 100 },

    },
    { timestamps: true }
);

const ticketModel = mongoose.model(ticketsCollection, ticketSchema);

export default ticketModel;