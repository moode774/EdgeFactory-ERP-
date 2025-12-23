import json

# Read the JSON file
with open('data.txt', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Count work orders
work_order_count = len(data.keys())

print(f"Total Work Orders: {work_order_count}")
print("\nWork Order Numbers:")
for i, wo_number in enumerate(data.keys(), 1):
    print(f"{i}. {wo_number}")
