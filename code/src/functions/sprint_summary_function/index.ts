// import dotenv from "dotenv";
// dotenv.config();
import { client } from "@devrev/typescript-sdk";
import axios from "axios";


export const run = async (events: any[]) => {
    for (const event of events) {
        const sprint_id = event.input_data.global_values.sprint_id;
        const slack_channel = event.input_data.global_values.slack_channel;
        // const { sprint_id, slack_channel } = event.inputs;
        const endpoint = event.execution_metadata.devrev_endpoint;
        // const patToken = event.context.secrets.service_account_token;
        // Use PAT and Slack tokens from environment variables
        // const patToken = process.env["PAT_TOKEN"];
        // const slackToken = process.env["SLACK_API_TOKEN"];
        const patToken="YOUR_PAT_TOKEN";
        const slackToken="YOUR_SLACK_TOKEN";

        if (!patToken || !slackToken) {
            throw new Error("Environment variables SLACK_API_TOKEN are missing.");
        }
        
        const matchingIssues = await fetchIssuesBySprint(endpoint, patToken, sprint_id);

        if (matchingIssues.length === 0) {
            console.error("No matching issues found for the sprint.");
            return;
        }

        // Group issues by their stage
        const issuesByStage = groupIssuesByStage(matchingIssues);

        // Calculate metrics like percentage of completed issues, etc.
        const progressMetrics = calculateMetrics(matchingIssues, issuesByStage);

        // Generate sprint summary
        const summary = generateSummary(issuesByStage, progressMetrics);

        // Post summary to Slack
        await postToSlack(slackToken, slack_channel, summary);
    }
};

// Fetch issues for a specific sprint using the works.list endpoint
async function fetchIssuesBySprint(endpoint: string, patToken: string, sprint_id: string) {
    const url = `${endpoint}/works.list?type=issue`;
    
    try {
        const response = await axios.post(
            url,
            {},
            {
                headers: {
                    Authorization: `Bearer ${patToken}`,
                },
            }
        );

        const issues = response.data?.works || [];

        
        const matchingIssues: {
            id: any; // Issue ID
            title: any; // Issue Title
            stage: any; // Stage Name
            state: any; // Stage State
            sprintId: any; // API Sprint ID
            sprintName: any; // Sprint Name
        }[] = [];

        // Filter issues that match the sprint ID
        issues.forEach((issue: any) => {
            if (issue.sprint) {
                const apiSprintId = issue.sprint.id; // API sprint ID
                const userSprintId = sprint_id; // User input sprint ID (e.g., SPB-28)

                // Check if the API sprint ID matches the input sprint ID
                if (apiSprintId.includes(userSprintId.split('-')[1])) {
                    matchingIssues.push({
                        id: issue.id, // Issue ID
                        title: issue.title, // Issue Title
                        stage: issue.stage?.name || "Unknown", // Stage Name
                        state: issue.stage?.state?.name || "Unknown", // Stage State
                        sprintId: apiSprintId, // API Sprint ID
                        sprintName: issue.sprint.name  // Sprint Name
                    });
                }
            }
        });

        return matchingIssues;

    } 
    catch (error) {
        console.error("Error fetching issues by sprint:", error);
        return [];
    }
}

// Group issues by their stage
function groupIssuesByStage(issues: any[]) {
    const groupedIssues: Record<string, any[]> = {};

    issues.forEach((issue: any) => {
        const stageName = issue.stage || "Unknown";
        if (!groupedIssues[stageName]) {
            groupedIssues[stageName] = [];
        }
        groupedIssues[stageName].push(issue);
    });

    return groupedIssues;
}

// Calculate metrics for the sprint
function calculateMetrics(issues: any[], groupedIssues: Record<string, any[]>) {
    const totalIssues = issues.length;
    return {
        totalIssues,
    };
}

//generate summary function
function generateSummary(groupedIssues: Record<string, any[]>, progressMetrics: any) {
    const totalIssues = progressMetrics.totalIssues;

    function calculatePercentage(count: number): number {
        return parseFloat(((count / totalIssues) * 100).toFixed(2));
    }

    function getInsight(stage: string, percentage: number): string {
        if (percentage >= 75) {
            return `Great work on the ${stage} stage! You've accomplished a significant portion of tasks here, showing strong efficiency and teamwork.`;
        } else if (percentage >= 50) {
            return `The ${stage} stage is progressing well, but there's room for improvement. Keep up the momentum to complete more tasks.`;
        } else if (percentage >= 25) {
            return `Progress in the ${stage} stage is a bit slow. Consider re-evaluating priorities or redistributing resources for better results.`;
        } else if(percentage>0){
            return `The ${stage} stage is lagging behind. Let's identify and address blockers to get things moving forward.`;
        }
        else{
            return `There are no issues present in this ${stage} state.`
        }
    }

    function formatSection(title: string, issues: any[]): string {
        const count = issues?.length || 0;
        const percentage = calculatePercentage(count);
        const taskList = count > 0 ? issues.map((issue: any) => `- ${issue.title}`).join("\n") : "None";
        const insight = getInsight(title, percentage);
        
        return `
### ${title} (${percentage}% of total tasks)
${taskList}

*Insight:* ${insight}
        `;
    }

    const completedTasks = formatSection("Completed Issues", groupedIssues["completed"]);
    const inDevelopmentTasks = formatSection("In Development Issues", groupedIssues["in_development"]);
    const prioritizedTasks = formatSection("Prioritized Issues", groupedIssues["prioritized"]);
    const wontFixTasks = formatSection("Won't Fix Issues", groupedIssues["wont_fix"]);
    const duplicateTasks = formatSection("Duplicates Issues", groupedIssues["duplicate"]);

    return `
Sprint Summary:

This sprint was packed with activity, and here's how things shaped up across different stages:

${completedTasks}

${inDevelopmentTasks}

${prioritizedTasks}

${wontFixTasks}

${duplicateTasks}

### Final Thoughts
Out of a total of ${totalIssues} tasks, the team has made noticeable strides in various areas. Let's keep refining our processes and pushing towards our goals in the next sprint!
    `;
}


// Send a message to Slack
async function postToSlack(slackToken: string, channel: string, text: string) {
    const url = "https://slack.com/api/chat.postMessage";
    const data = JSON.stringify({channel,text});

    try {
        const response = await axios.post(
            url,
            data,
            { headers: { Authorization: `Bearer ${slackToken}`,
                "Content-Type": "application/json"
            } }
        );
        console.log("API Response:", response.data);
        if (!response.data.ok) {
            console.error("Slack API error:", response.data.error);
            console.error("Full response:", response.data); 
        }
    } catch (error) {
        console.error("Error posting to Slack:", error);
    }
}


export default run;
