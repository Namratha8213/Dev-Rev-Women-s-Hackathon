# Snap-In for Sprint Summarization
### Objective
This project automates the process of generating a sprint summary at the end of each sprint and delivers it to a specified Slack channel. The summary highlights key sprint details, including:

- What went well

- What went wrong

- Actionable insights for future sprints

### Core Features
#### Sprint Overview Generation

Automatically gather data about completed, in-progress, and blocked tasks during the sprint using DevRev's API.
#### Summarization

- What went well: Highlights successful tasks or aspects of the sprint.

- What went wrong: Summarizes blockers or issues faced.

- Retrospective insights: Provides recommendations and actionable insights for future sprints.

#### Slack Integration

Posts the sprint summary to a user-configured Slack channel using the Slack API.

### Tools and Technologies
#### APIs:
- DevRev for sprint data tracking (${endpoint}/works.list?type=issue).
  
- Slack for sending sprint summaries.
#### Languages:
- TypeScript.
#### Platform: 
- DevRev snap-in platform.

### Workflow
#### 1. Snap-In Configuration

The user configures the snap-in by providing:

- Sprint ID: The ID of the sprint to summarize.
  
- Slack Channel ID: The target channel where the summary will be posted.
  
- This configuration ensures flexibility and user-specific setup.
  
#### 2. Triggering the Summary Generation

- The user navigates to any issue in the sprint and enters the command name in the discussion surface of the DevRev platform.
  
- This triggers the function that fetches sprint details using the DevRev endpoint.
  
#### 3. Data Fetching and Validation

- The function collects sprint details, checking the provided Sprint ID and Slack Channel ID in the snap-in configuration.
  
- If validated, the system processes the sprint data to generate the summary.
#### 4. Summary Generation

- The sprint summary evaluates:
- Issues in various stages.
- Percentage of issues at each stage.
- Insights into "What went well" and "What went wrong" at each stage.
#### 5. Posting to Slack

- The summary is posted to the configured Slack channel.

## Installation and Usage
### Prerequisites
- A DevRev account and snap-in access.
- Genrate PAT and SLACK_API_TOKEN.
- Slack workspace with a channel to post sprint summaries.

### Steps
#### 1. Clone the Repository


```bash
git clone https://github.com/Namratha8213/Dev-Rev-Women-s-Hackathon.git
 
cd sprint-summarization-snapin
```
#### 2. Set Up the Snap-In

- Configure the snap-in by providing:
   -  Sprint ID
   -  Slack Channel ID
#### 3. Trigger Summary Generation

- Go to any sprint issue on the DevRev platform.
- Use the  discussion surface and trigger the function with the command name.
#### 4. Review the Summary

- The sprint summary will be generated and posted to the specified Slack channel.



## Documentation help
### Getting started with the template

1. Create a new repository using this template.
2. In the new repository, you can add functions at the path `src/functions` where the folder name corresponds to the function name in your manifest file.
3. Ensure to include each new function in the file named "src/function-factory.ts".


### Deploying Snap-ins

Once you are done with the testing, run the following commands to deploy your snap-in:

1. Authenticate to devrev CLI, run the following command:

```
devrev profiles authenticate --org <devorg name> --usr <user email>
```

2. To create a snap_in_version, run the following command:

```
devrev snap_in_version create-one --path <template path> --create-package
```

3. Draft the snap_in, run the following command:

```
devrev snap_in draft
```

4. To update the snap-in, run the following command:

```
devrev snap_in update
```

5. Activate the snap_in

```
devrev snap_in activate
```




### Receiving events locally

After the snap-in has been activated, it can receive events locally from DevRev as a
snap-in would. If the snap-in was listening to `work_created` event type, then creating a
new work-item would send the event to the local server.

If utilizing ngrok, accessing the ngrok UI is possible by opening http://127.0.0.1:4040/ in the browser. This interface offers a neat way to review the list of requests and replay them if necessary.

The service account token included with the request is valid for only 30 minutes. Therefore, attempting to call the DevRev API with that token for events older than this timeframe will result in a '401 Unauthorized' error.

### Updating manifest or the URL

The code can be changed without the need to create a snap-in version or redeploy the snap-in. On any change to the
`src` folder, the server restarts with the updated changes. However, on [patch compatible](https://developer.devrev.ai/snap-in-development/upgrade-snap-ins#version-compatibility) updates to the manifest or the testing URL, we can `upgrade` the snap-in version.

```
devrev snap_in_version upgrade --manifest <PATH_TO_MANIFEST> --testing-url <UPDATED_URL>
```

In case of non-patch compatible updates, the `force` flag can be used to upgrade the version. However this will delete any
existing snap-ins that have been created from this version.

```
devrev snap_in_version upgrade --force --manifest <PATH_TO_MANIFEST> --testing-url <UPDATED_URL>
```

Do note that manifest must always be provided when upgrading a snap-in version.
