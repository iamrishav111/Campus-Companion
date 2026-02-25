# Changes for your friend's `app.py`

Please ask your friend to replace their `TicketUpdate` and `update_ticket` functions (around line 68) with this new block:

```python
# ================= UPDATE TICKET =================
class TicketUpdate(BaseModel):
    ticket_id: str
    status: str | None = None
    assigned_to: str | None = None
    category: str | None = None


@app.put("/update-ticket")
def update_ticket(data: TicketUpdate):
    ticket_ref = db.collection("tickets").document(data.ticket_id)

    update_data = {}

    if data.status:
        update_data["status"] = data.status

    if data.assigned_to is not None:
        update_data["assigned_to"] = data.assigned_to

    if data.category is not None:
        update_data["category"] = data.category

    update_data["updated_at"] = datetime.utcnow()

    ticket_ref.update(update_data)

    return {
        "message": "Ticket updated successfully",
        "updated_fields": update_data
    }
```
