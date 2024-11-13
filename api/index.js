import express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import bodyParser from "body-parser";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 5000;
const jobsFilePath = join(__dirname, "../jobs.json");

const corsOptions = {
  origin: '*',
  methods: 'GET,PUT,POST,DELETE',
  optionsSuccessStatus: 200,
  credentials: true,
  allowedHeaders: 'Content-Type, Authorization, Credentials'
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

const readJobsData = () => {
  const rawData = fs.readFileSync(jobsFilePath);
  return JSON.parse(rawData);
};

const writeJobsData = (data) => {
  fs.writeFileSync(jobsFilePath, JSON.stringify(data, null, 2));
};

app.get("/jobs", (req, res) => {
  try {
    const jobs = readJobsData();
    res.json(jobs);
  } catch (error) {
    res.status(500).send("Error reading jobs data");
  }
});

app.get("/jobs/:id", (req, res) => {
  const { id } = req.params;
  try {
    const jobs = readJobsData();
    const job = jobs.find((job) => job.id === id);
    if (job) {
      res.json(job);
    } else {
      res.status(404).send("Job not found");
    }
  } catch (error) {
    res.status(500).send("Error reading jobs data");
  }
});

app.post("/jobs", (req, res) => {
  const { title, description, company, location, salary, type } = req.body;

  if (!title || !description) {
    return res.status(400).send("Title and description are required");
  }

  try {
    const jobs = readJobsData();
    const newJob = {
      id: String(parseInt(jobs[jobs.length - 1].id, 10) + 1),  // Use current timestamp as unique ID
      title,
      description,
      company, location, salary, type
    };
    jobs.push(newJob);
    writeJobsData(jobs);
    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).send("Error adding new job");
  }
});

app.put("/jobs/:id", (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).send("Title and description are required");
  }

  try {
    const jobs = readJobsData();
    const jobIndex = jobs.findIndex((job) => job.id === id);
    if (jobIndex === -1) {
      return res.status(404).send("Job not found");
    }

    jobs[jobIndex] = { id, title, description };
    writeJobsData(jobs);
    res.json(jobs[jobIndex]);
  } catch (error) {
    res.status(500).send("Error updating job");
  }
});

app.delete("/jobs/:id", (req, res) => {
  const { id } = req.params;
  try {
    const jobs = readJobsData();
    const jobIndex = jobs.findIndex((job) => job.id === id);
    if (jobIndex === -1) {
      return res.status(404).send("Job not found");
    }

    jobs.splice(jobIndex, 1);
    writeJobsData(jobs);
    res.status(204).send();
  } catch (error) {
    res.status(500).send("Error deleting job");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
