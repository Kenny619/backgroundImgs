export interface Bindings {
	BUCKET: R2Bucket;
}
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: Bindings }>();
app.use("*", cors());

app.get("/", async (c) => {
	const bucket = c.env.BUCKET;

	// List objects in the bucket
	const listed = await bucket.list();
	// Filter for image files
	const imageFiles = listed.objects.filter(
		(obj) => obj.key.startsWith("uploaded/") && obj.key.endsWith(".jpg"),
	);

	if (imageFiles.length === 0) {
		return c.text("No images found", 404);
	}

	// Select a random image
	const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];

	// Get the image data
	const object = await bucket.get(randomImage.key);

	if (object === null) {
		return c.text("Image not found", 404);
	}

	// Return the image with appropriate headers
	return new Response(object.body, {
		headers: {
			"Content-Type": object.httpMetadata?.contentType || "image/jpeg",
			"Cache-Control": "public, max-age=3600",
		},
	});
});

export default app;
