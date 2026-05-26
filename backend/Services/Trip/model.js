import mongoose from "mongoose";
const PlaceSchema = new mongoose.Schema(
  {
    name: String,
    category: String,
    categoryType: { type: String, enum: ["MustVisit", "Restaurant", "Hotel"], default: "MustVisit" },
    description: String,
    location: String,
    rating: Number,
    reviews: Number,
    status: String,
    imageUrl: String,
    lat: Number,
    lng: Number,
  },
  { _id: false }
);


const TripSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  distance: Number,
  duration: Number,
  summary: String,
  highlights: String,
  itinerary: String,
  places: [PlaceSchema],
  isFavorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});


export default mongoose.models.Trip || mongoose.model("Trip", TripSchema);
