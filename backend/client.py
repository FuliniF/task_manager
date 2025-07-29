import os
import openai
from supabase import create_client, Client
from pydantic import BaseModel
from keys import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

class damy_format(BaseModel):
    cat_name: str
    cat_sex: str

class LLM:
    def __init__(self, model="gpt-4.1-nano") -> None:
        self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY_CGI"))
        self.model = model
    
    def chat(self, message, temperature=0.0, max_tokens=1000, text_format=None):
        if text_format is not None:
            response = self.client.responses.parse(
                model=self.model,
                input=message,
                temperature=temperature,
                max_output_tokens=max_tokens,
                text_format=text_format,
            )
            res_text = response.output_parsed
        else:
            response = self.client.responses.create(
                model=self.model,
                input=message,
                temperature=temperature,
                max_output_tokens=max_tokens,
            )
            res_text = response.output[0].content[0].text
        return res_text

class SupabaseClient:
    def __init__(self) -> None:
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    def get_client(self):
        return self.supabase


def test():
    message = [{"role": "user", "content": "Introduce yourself in one sentence."}]
    llm = LLM()
    response = llm.chat(message)
    print(response)
    print("------")
    message = [{"role": "user", "content": "give me one name for a cat and specify its sex."}]
    llm = LLM()
    response = llm.chat(message, text_format=damy_format)
    print(response)

if __name__ == "__main__":
    test()