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
