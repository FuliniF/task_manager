gen_goal_prompt = "Give a brief summary from the user about their goal. The goal should be clear, short, and specific. Input: {goal}. Answer in a single sentence."
gen_status_prompt = "From the given description and previous status (if any), provide the current status of the goal. Goal: {goal}. Previous Status: {previous_status}. User description: {user_description}. Answer in a single sentence."
gen_milestone_prompt = "From the given goal and user status, provide a list of milestones and the corresponding descriptions that can be achieved by the user. The milestones should be reasonable and achievable. Goal: {goal}. Status: {status}."
gen_mission_prompt = "To achieve the given goal, status, and milestones, provide a list of missions for the user to complete in a reasonable time period, and specify the needed duration (in minute) and repeat count for each mission. \
    The missions should be specific and achievable. Goal: {goal}. Status: {status}. Milestones: {milestones}."
