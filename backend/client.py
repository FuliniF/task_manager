import os

import openai
from dotenv import load_dotenv
from pydantic import BaseModel
from supabase import Client, create_client

load_dotenv()


class damy_format(BaseModel):
    cat_name: str
    cat_sex: str


class LLM:
    def __init__(self, model="gpt-4.1-nano") -> None:
        OPENAI_API_KEY_CGI = os.getenv("OPENAI_API_KEY_CGI")
        self.client = openai.OpenAI(api_key=OPENAI_API_KEY_CGI)
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
        SUPABASE_URL = os.getenv("SUPABASE_URL")
        SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    def get_client(self):
        return self.supabase


def test():
    message = [{"role": "user", "content": "Introduce yourself in one sentence."}]
    llm = LLM()
    response = llm.chat(message)
    print(response)
    print("------")
    message = [
        {"role": "user", "content": "give me one name for a cat and specify its sex."}
    ]
    llm = LLM()
    response = llm.chat(message, text_format=damy_format)
    print(response)


if __name__ == "__main__":
    test()
