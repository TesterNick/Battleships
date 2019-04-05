#!/usr/bin/env python3


class Player:

    def __init__(self, ip):
        self.id = ip
        self.ships = None
        self.status = "queue"
        self.last_shot = None

    def set_status_attack(self):
        self.status = "attacker"

    def set_status_wait(self):
        self.status = "wait"

    def set_status_positioning(self):
        self.status = "positioning"

    def set_status_win(self):
        self.status = "win"

    def set_status_lose(self):
        self.status = "lose"

    def is_winner(self):
        return self.status == "win"

    def is_loser(self):
        return self.status == "lose"

    def is_attacking(self):
        return self.status == "attacker"

    def is_positioning(self):
        return self.status == "positioning"

    def is_waiting(self):
        return self.status == "wait"

    def add_ships(self, ships):
        ships = self.string_to_list(str(ships))
        if self.validate_ships(ships):
            self.ships = ships

    @staticmethod
    def string_to_list(string):
        result = []
        lst = string.strip("][").strip().split("], [")
        for sub_list in lst:
            new_sublist = []
            for element in sub_list.split(","):
                elem = ""
                for char in element:
                    if char.isalnum():
                        elem += char
                new_sublist.append(elem)
            result.append(new_sublist)
        return result

    def validate_ships(self, ships):
        return (len(ships) == 10 and
                self.validate_ships_by_type(ships) and
                not self.ships_are_intersected(ships))

    @staticmethod
    def validate_ships_by_type(ships):
        one_deck = 0
        two_deck = 0
        three_deck = 0
        four_deck = 0
        for ship in ships:
            if len(ship) == 0 or len(ship) > 4:
                return False
            elif len(ship) == 1:
                one_deck += 1
            elif len(ship) == 2:
                two_deck += 1
            elif len(ship) == 3:
                three_deck += 1
            elif len(ship) == 4:
                four_deck += 1
        return one_deck == 4 and two_deck == 3 and three_deck == 2 and four_deck == 1

    @staticmethod
    def ships_are_intersected(ships):
        plain_cells = []
        for arr in ships:
            plain_cells.extend(arr)
        for cell in plain_cells:
            if plain_cells.count(cell) > 1:
                return True
        return False


class Game:

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
                    self.check_game_over()
                self.attacker.last_shot = result
                return result
        result = {shot: "miss"}
        self.attacker.last_shot = result
        self.change_turn()
        return result

    def check_game_over(self):
        if len(self.attacked.ships) == 0:
            self.stage.set_next_stage()
            self.attacker.set_status_win()
            self.attacked.set_status_lose()

    def change_turn(self):
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
