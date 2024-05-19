import cohere
import os
import subprocess

COHERE_API_KEY = os.environ.get("COHERE_API_KEY")

def get_latex(prompts, file):
    latex_as_string = file
    result = latex_as_string
    co = cohere.Client(api_key=COHERE_API_KEY)
    for prompt in prompts:
      full_prompt = "Output should be raw LaTex, 1 ready to be compiled and removed all comments. Don't include any comment.\n"+ prompt + result + " Output: ..."
      response = co.chat(
          model="command-r-plus",
          message=full_prompt
      )
      result = response.text

    return result

ALLOWED_EXTENSIONS = {"txt", "pdf", "png", "jpg", "jpeg", "gif", "tex"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def latex_to_pdf(latex_string, output_file):
    try:
        print(f"Latex string: {latex_string}")
        with open("tmep.tex", "w") as f:
            f.write(latex_string)

        # Run pdflatex to convert .tex to .pdf
        subprocess.run(["pdflatex", "-interaction=nonstopmode", "temp.tex"])

        # Move the generated PDF to the desired output file path
        subprocess.run(["mv", "temp.pdf", output_file])

    finally:
        # clean up the temp file
        subprocess.run(["rm", "temp.tex", "temp.log", "temp.aux"])
        

