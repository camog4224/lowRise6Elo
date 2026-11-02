const http = require("http");
const seed = require("../local-data/seed.json");

const host = "127.0.0.1";
const port = 8080;
const projectId = "lr6elo";

function firestoreValue(value) {
	if (typeof value === "string") {
		return { stringValue: value };
	}
	if (typeof value === "boolean") {
		return { booleanValue: value };
	}
	if (Number.isInteger(value)) {
		return { integerValue: String(value) };
	}
	if (typeof value === "number") {
		return { doubleValue: value };
	}
	if (Array.isArray(value)) {
		return { arrayValue: { values: value.map(firestoreValue) } };
	}
	throw new TypeError(`Unsupported seed value: ${typeof value}`);
}

function createDocument(collection, id, fields) {
	return new Promise((resolve, reject) => {
		const body = JSON.stringify({
			fields: Object.fromEntries(
				Object.entries(fields).map(([key, value]) => [
					key,
					firestoreValue(value),
				])
			),
		});
		const request = http.request(
			{
				host,
				port,
				method: "PATCH",
				path: `/v1/projects/${projectId}/databases/(default)/documents/${collection}/${encodeURIComponent(id)}`,
				headers: {
					"Content-Type": "application/json",
					"Content-Length": Buffer.byteLength(body),
				},
			},
			(response) => {
				let responseBody = "";
				response.on("data", (chunk) => {
					responseBody += chunk;
				});
				response.on("end", () => {
					if (response.statusCode >= 200 && response.statusCode < 300) {
						resolve();
					} else {
						reject(new Error(`${response.statusCode}: ${responseBody}`));
					}
				});
			}
		);
		request.on("error", reject);
		request.write(body);
		request.end();
	});
}

async function main() {
	for (const [collection, documents] of Object.entries(seed)) {
		for (const [id, fields] of Object.entries(documents)) {
			await createDocument(collection, id, fields);
		}
	}
	console.log("Seeded local Firestore data.");
}

main().catch((error) => {
	console.error("Unable to seed local Firestore:", error.message);
	process.exitCode = 1;
});
