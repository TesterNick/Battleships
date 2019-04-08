#!/usr/bin/env python3
import socket

from game_admin import GameAdmin


SERVER_ADDRESS = (HOST, PORT) = '', 8000


class Response:
    """
    Class generates  http responses for GET requests, and
    adds http related information to the response generated
    by the game admin for POST requests.
    """
    def __init__(self, admin):
        self.status = ""
        self.headers = []
        self.body = ""
        self.game_admin = admin

    def add_header(self, header):
        self.headers.append(header)

    def response_post(self, client_address, message):
        answer = self.game_admin.request(client_address, message)
        self.status = "HTTP/1.1 200 OK"
        self.body = bytes(answer)

    def response_get(self, request):
        try:
            target = request.split(" ")[1]
            page = ".." + target if target != "/" else "../index.html"
            with open(page, "rb") as f:
                self.status = "HTTP/1.1 200 OK"
                self.headers.append(self.get_content_type_header(page))
                self.body = f.read().decode()
        except (IndexError, FileNotFoundError):
            self.status = "HTTP/1.1 404 Not found"

    @staticmethod
    def get_content_type_header(file):
        extension = file.split(".")[-1]
        if extension in ["html", "css"]:
            return "Content-Type: text/{}".format(extension)
        elif extension == "js":
            return "Content-type: application/x-javascript"
        else:
            return ""

    def to_string(self):
        headers = "\n".join(self.headers)
        string = "{}\n{}\n\n{}".format(self.status, headers, self.body)
        return bytes(string, "UTF8")


class Server:

    def __init__(self):
        self.game_admin = GameAdmin()

    def handle_request(self, client_connection, client_address):
        request = client_connection.recv(1024).decode()
        message = self.get_message(request)
        http_response = Response(self.game_admin)
        http_response.add_header("Connection: close")
        if "POST" in request:
            http_response.response_post(client_address, message)
        else:
            http_response.response_get(request)
        client_connection.sendall(http_response.to_string())

    @staticmethod
    def get_message(request):
        msg = request.split("\r\n\r\n", 1)[-1]
        msg = msg.split("=")
        if len(msg) > 2:
            return None
        msg = {msg[0]: msg[-1]}
        return msg

    def serve_forever(self):
        listen_socket = socket.socket()
        listen_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        listen_socket.bind(SERVER_ADDRESS)
        listen_socket.listen(5)
        print('Serving HTTP on port {} ...'.format(PORT))

        while True:
            client_connection, client_address = listen_socket.accept()
            self.handle_request(client_connection, client_address[0])
            client_connection.close()


if __name__ == '__main__':
    server = Server()
    server.serve_forever()
