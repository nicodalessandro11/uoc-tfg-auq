# 🧠 NLP Model with SQL Database Integration

This project implements a Natural Language Processing (NLP) agent using [LangChain](https://github.com/langchain-ai/langchain) and [Ollama](https://ollama.com) to translate natural language questions into SQL queries and execute them on a PostgreSQL database hosted in Supabase.

## 🚀 Features

- ✅ Local LLaMA 3B model running via Ollama (no cloud token needed)
- ✅ PostgreSQL database integration (via Supabase)
- ✅ LangChain agent powered by SQL toolkit
- ✅ Custom prompt for domain-specific query generation (urban & demographic data)

## 📋 Prerequisites

- Python 3.11+
- [Ollama](https://ollama.com/) installed (`brew install ollama`)
- Supabase PostgreSQL database URI
- Make (optional, but recommended for command shortcuts)

## 🔧 Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd nlp-model
   ```

2. **Create the `.env` file**:
   ```bash
   cp .env.example .env
   ```
   Add your Supabase credentials:
   ```
   SUPABASE_URI=your_supabase_postgres_uri
   ```

3. **Start Ollama and pull the model**:
   ```bash
   ollama serve
   ollama pull llama3:3b
   ```

4. **Set up the environment and install dependencies**:
   ```bash
   make setup
   ```

## 🎯 Usage

To run the project and ask a natural language question:
```bash
make run
```

Edit `main.py` to change the input question:
```python
question = "What is the neighborhood with the greatest number of people in Barcelona?"
```

## ⚙️ Makefile Commands

- `make setup` – Create virtual environment and install all dependencies
- `make install` – Install project dependencies
- `make run` – Launch the app with the LLM agent
- `make clean` – Remove Python cache and temporary files

## 📂 Project Structure

```bash
.
├── main.py              # Main application script
├── custom_prompt.txt    # Domain-specific prompt for the SQL agent
├── requirements.txt     # Python dependencies
├── Makefile             # Utility commands
├── .env                 # Environment variables (user-provided)
```

## 📝 Notes

- This setup uses the lightweight LLaMA 3B model for fast, local execution
- The SQL database must follow the schema defined in `custom_prompt.txt`
- Ensure Ollama is running before executing the model

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repo and open pull requests or issues.

## 📄 License

This project is under the MIT License – see the [LICENSE](LICENSE) file for details.