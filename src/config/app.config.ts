import { registerAs } from "@nestjs/config";

export default registerAs('application', () => ({
    msEnv: 'Dev', // Local | Dev | Uat | Prod
    projectId: "ec-board-101",
    apiKey: "6G757WF-DWQ57D5-JF69PB0-H5FV19E",
    //privateKey:,
    clientEmail: "ecservicenow.boat@mail.com",
    /* -- MicroService Config -- */
}));