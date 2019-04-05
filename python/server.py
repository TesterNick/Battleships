#!/usr/bin/env python3
import socket

import game_admin


SERVER_ADDRESS = (HOST, PORT) = '', 8000


class Server:

    def __init__(self):
        self.game_admin = game_admin.GameAdmin()

    # Редирект на файлы-заглушки до реализации фронт-енда
    @staticmethod
    def redirect(page):
        page = page + ".html"
        with open(page) as f:
            return f.read()

    def handle_request(self, client_connection, client_address):
        request = client_connection.recv(1024).decode()
        message = self.get_message(request)
        http_response = "HTTP/1.1 200 OK\nConnection: close\n\n"
        if "POST" in request:
            answer = self.game_admin.request(client_address, message)
            if isinstance(answer, str):
                http_response += self.redirect(answer)
            else:
                http_response += str(answer)
        else:
            http_response += self.redirect("index")
        client_connection.sendall(bytes(http_response, "UTF8"))

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
