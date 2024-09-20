export interface Env {
	BUCKET: R2Bucket;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const bucket = env.BUCKET;

		// List objects in the bucket
		const listed = await bucket.list();
		// Filter for image files
		const imageFiles = listed.objects.filter(
			(obj) => obj.key.startsWith("uploaded/") && obj.key.endsWith(".jpg"),
		);

		if (imageFiles.length === 0) {
			return new Response("No images found", { status: 404 });
		}

		// Select a random image
		const randomImage =
			imageFiles[Math.floor(Math.random() * imageFiles.length)];

		// Get the image data
		const object = await bucket.get(randomImage.key);

		if (object === null) {
			return new Response("Image not found", { status: 404 });
		}

		// Return the image with appropriate headers
		return new Response(object.body, {
			headers: {
				"Content-Type": object.httpMetadata?.contentType || "image/jpeg",
				"Cache-Control": "public, max-age=3600",
			},
		});
	},
};
