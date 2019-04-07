from game import Game
from player import Player


class GameAdmin:

    def __init__(self):
        self.players_queue = []
        self.games = []

    def find_game(self, player):
        for game in self.games:
            if player in game.players:
                return game
        return None

    def find_player_by_address(self, address):
        for player in self.players_queue:
            if player.id == address:
                return player
        for game in self.games:
            for player in game.players:
                if player.id == address:
                    return player
        return None

    def player_have_game(self, player):
        for game in self.games:
            if player in game.players:
                return True
        return False

    def request(self, address, msg):
        player = self.find_player_by_address(address)
        player = player if player else Player(address)
        game = self.find_game(player)
        if game:
            rival = game.get_rival(player)
            if game.stage.is_positioning():
                if game.ready_to_start():
                    game.stage.set_next_stage()
                    game.start()
                elif not player.ships:
                    if "createShips" in msg.keys():
                        player.add_ships(msg["createShips"])
                    else:
                        player.set_status_positioning()
                        return "createShips"
                    player.set_status_wait()
                return "waitGame"
            elif game.stage.is_fighting():
                if player.is_attacking():
                    if "shot" in msg.keys():
                        return game.make_shot(msg["shot"])
                    else:
                        return "fight"
                else:
                    if rival.last_shot:
                        last_shot = rival.last_shot
                        rival.last_shot = None
                        return last_shot
                    else:
                        return "waitTurn"
            elif game.stage.is_finished():
                if player.is_winner():
                    return {"finish": "win"}
                else:
                    return {"finish": "lost"}
        else:
            if "cancel" in msg.keys() and player in self.players_queue:
                self.players_queue.remove(player)
                return "index"
            elif "start" in msg.keys():
                self.start_new_game(player)
                player.set_status_wait()
                return "waitStart"
            elif "waitStart" in msg.keys():
                return "waitStart"
            else:
                return "index"

    def start_new_game(self, player):
        if len(self.players_queue) > 0:
            self.games.append(Game([player, self.players_queue.pop(0)]))
        else:
            self.players_queue.append(player)
