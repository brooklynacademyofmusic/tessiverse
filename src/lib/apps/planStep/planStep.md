Creates a new plan step using the content of an email sent to [planstep@bam.org](mailto:planstep@bam.org).

☝️ you'll need to be the worker on a plan in Tessitura. 

📩 Send an email to [planstep@bam.org](mailto:planstep@bam.org)!

🔎 The corresponding plan will be identified based on words in the subject line and body of the email that match:
* the email address of the constituent described by the plan
* the customer number of the constituent described by the plan
* the first and last name of the constituent described by the plan

🕵🏼‍♀️ If it finds more than one matching plan, then the corresponding plan will be picked based on words in the subject line and body of the email that match:
* the campaign of the plan
* the designation of the plan

⏱️ If the matching plan is *still* ambiguous, a plan step will be created on the most recently updated, matching plan.

🔙 An email will be sent back to you, either letting you know a step was created successfully, or what went wrong!