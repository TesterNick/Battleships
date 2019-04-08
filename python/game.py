class Game:
    """
    Main game class. Stores players, checks statuses
    and implements game logic.
    """
    def __init__(self, players):
        self.players = players
        self.attacker = self.players[0]
        self.attacked = self.players[1]
        self.stage = GameStage()

    def start(self):
        for player in self.players:
            if player == self.attacker:
                player.set_status_attack()

    def get_rival(self, player1):
        for player2 in self.players:
            if player2 != player1:
                return player2

    def ready_to_start(self):
        for player in self.players:
            if not (player.ships and
                    (player.is_waiting() or
                     player.is_attacking())):
                return False
        return True

    def make_shot(self, shot):
        for ship in self.attacked.ships:
            if shot in ship:
                ship.remove(shot)
                if len(ship) > 0:
                    result = {shot: "hit"}
                else:
                    self.attacked.ships.remove(ship)
                    result = {shot: "sunk"}
                    self._check_game_over()
                self.attacker.last_shot = result
                return result
        result = {shot: "miss"}
        self.attacker.last_shot = result
        self._change_turn()
        return result

    def _check_game_over(self):
        if len(self.attacked.ships) == 0:
            self.stage.set_next_stage()
            self.attacker.set_status_win()
            self.attacked.set_status_lose()

    def _change_turn(self):
        for player in self.players:
            if player.is_attacking():
                player.set_status_wait()
                self.attacked = player
            elif player.is_waiting():
                player.set_status_attack()
                self.attacker = player


class GameStage:

    def __init__(self):
        self.status = "positioning"

    def set_next_stage(self):
        if self.is_positioning():
            self.status = "fighting"
        elif self.is_fighting():
            self.status = "finished"

    def is_positioning(self):
        return self.status == "positioning"

    def is_fighting(self):
        return self.status == "fighting"

    def is_finished(self):
        return self.status == "finished"
