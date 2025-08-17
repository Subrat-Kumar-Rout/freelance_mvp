import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let users = [];
let gigs = [];
let jobs = [];

// helper to find user by email
app.post("/signup", (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email || !role) return res.status(400).json({ message: "name, email, role required" });
  const exists = users.find(u => u.email === email);
  if (exists) return res.status(400).json({ message: "User already exists" });
  const user = { id: users.length + 1, name, email, role };
  users.push(user);
  res.json(user);
});

app.post("/login", (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

app.post("/gigs", (req, res) => {
  const { user_id, title, description, price } = req.body;
  if (!user_id || !title) return res.status(400).json({ message: "user_id and title required" });
  const gig = { id: gigs.length + 1, user_id, title, description: description || "", price: price || 0 };
  gigs.push(gig);
  res.json(gig);
});

app.get("/gigs", (req, res) => {
  res.json(gigs);
});

app.post("/jobs", (req, res) => {
  const { client_id, title, description } = req.body;
  if (!client_id || !title) return res.status(400).json({ message: "client_id and title required" });
  const job = { id: jobs.length + 1, client_id, freelancer_id: null, title, description: description || "", status: "Pending" };
  jobs.push(job);
  res.json(job);
});

app.get("/jobs", (req, res) => {
  res.json(jobs);
});

// simple hire endpoint (assign freelancer)
app.post("/jobs/:id/hire", (req, res) => {
  const jobId = Number(req.params.id);
  const { freelancer_id } = req.body;
  const job = jobs.find(j => j.id === jobId);
  if (!job) return res.status(404).json({ message: "Job not found" });
  job.freelancer_id = freelancer_id;
  job.status = "Accepted";
  res.json(job);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
