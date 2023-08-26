FROM python:3.10

WORKDIR /usr/src/server

ENV FLASK_APP=src/server.py
ENV PYTHONPATH /usr/src/server
ENV FLASK_ENV=development

COPY ./requirements.txt ./

RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000

CMD python src/__init_app__.py ; python src/server.py