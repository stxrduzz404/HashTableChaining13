#include <array>
#include <iostream>
#include <limits>

class HashTable {
private:
    static constexpr int TABLE_SIZE = 13;

    struct Node {
        int key;
        Node* next;

        Node(int value, Node* nextNode) : key(value), next(nextNode) {}
    };

    std::array<Node*, TABLE_SIZE> buckets{};

public:
    HashTable() = default;

    // Prevent accidental shallow copies of the linked lists.
    HashTable(const HashTable&) = delete;
    HashTable& operator=(const HashTable&) = delete;

    ~HashTable() {
        clear();
    }

    static int hashFunction(int key) {
        // The second modulo makes negative keys map to the range 0..12 too.
        return ((key % TABLE_SIZE) + TABLE_SIZE) % TABLE_SIZE;
    }

    void insert(int key) {
        const int index = hashFunction(key);

        // Chaining: insert the new node at the front of this bucket's list.
        buckets[index] = new Node(key, buckets[index]);
    }

    bool contains(int key) const {
        const int index = hashFunction(key);
        Node* current = buckets[index];

        while (current != nullptr) {
            if (current->key == key) {
                return true;
            }
            current = current->next;
        }

        return false;
    }

    void display() const {
        std::cout << "\nHash table (hash function: key % 13)\n";
        std::cout << "New nodes are inserted at the front of each chain.\n\n";

        for (int index = 0; index < TABLE_SIZE; ++index) {
            std::cout << '[' << index << "] ";
            Node* current = buckets[index];

            if (current == nullptr) {
                std::cout << "EMPTY";
            }

            while (current != nullptr) {
                std::cout << current->key << " -> ";
                current = current->next;
            }

            if (buckets[index] != nullptr) {
                std::cout << "NULL";
            }

            std::cout << '\n';
        }
    }

    void clear() {
        for (Node*& head : buckets) {
            while (head != nullptr) {
                Node* nodeToDelete = head;
                head = head->next;
                delete nodeToDelete;
            }
        }
    }
};

int main() {
    constexpr int NUMBER_COUNT = 15;
    HashTable table;

    std::cout << "Hash Table - Separate Chaining\n";
    std::cout << "Please enter " << NUMBER_COUNT << " integers.\n\n";

    for (int count = 1; count <= NUMBER_COUNT; ++count) {
        int key = 0;

        while (true) {
            std::cout << "Number " << count << ": ";

            if (std::cin >> key) {
                break;
            }

            if (std::cin.eof()) {
                std::cerr << "\nInput ended before 15 integers were entered.\n";
                return 1;
            }

            std::cout << "Invalid input. Please enter an integer.\n";
            std::cin.clear();
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        }

        const int index = HashTable::hashFunction(key);
        table.insert(key);
        std::cout << "  h(" << key << ") = " << key << " % 13 = "
                  << index << '\n';
    }

    table.display();

    return 0;
}
