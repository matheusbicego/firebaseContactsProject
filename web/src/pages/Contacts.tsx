import {
  Button,
  Modal,
  Select,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import BasicTable from "../components/Table";
import { useState } from "react";
import {
  createContact,
  updateContact,
  deleteContact,
} from "../services/contacts";
import { useAuth } from "../hooks/useAuth";
import useConnections from "../hooks/useConnections";
import useContacts from "../hooks/useContacts";
import { createMessage } from "../services/messages";

type Contact = {
  id: string;
  name: string;
  number: string;
  connectionId: string;
  connectionName: string;
  edit: string;
  delete: string;
};

type ModalState = {
  type: "add" | "edit" | "send" | null;
};

export default function Contacts() {
  const { user } = useAuth();
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [open, setOpen] = useState<ModalState>({ type: null });
  const [newNameContact, setNewNameContact] = useState("");
  const [newPhoneContact, setNewPhoneContact] = useState("");
  const [newConnectionIdContact, setNewConnectionIdContact] = useState("");
  const [newNameUpdateContact, setNewNameUpdateContact] = useState("");
  const [newPhoneUpdateContact, setNewPhoneUpdateContact] = useState("");
  const [messageToSend, setMessageToSend] = useState<{
    title: string;
    text: string;
    time: Dayjs | null;
    schedule: boolean;
  }>({ title: "", text: "", time: dayjs(), schedule: false });
  const [newConnectionIdUpdateContact, setNewConnectionIdUpdateContact] =
    useState("");
  const [selectableRow, setSelectableRow] = useState<Contact | null>(null);
  const [loadButton, setLoadButton] = useState(false);
  const { contacts, fetchContacts } = useContacts(user?.uid);
  const { connections } = useConnections(user?.uid);
  const columns = [
    {
      key: "name",
      header: "Nome",
      render: (r: Contact) => r.name,
      sortable: true,
      accessor: (r: Contact) => r.name,
    },
    {
      key: "number",
      header: "Telefone",
      render: (r: Contact) => r.number,
      sortable: true,
      accessor: (r: Contact) => r.number,
    },
    {
      key: "connectionName",
      header: "Conexão",
      render: (r: Contact) => r.connectionName,
      sortable: true,
      accessor: (r: Contact) => r.connectionName,
    },
    {
      key: "edit",
      header: "Editar",
      render: (r: Contact) => (
        <Button
          onClick={() => {
            setSelectableRow(r);
            setNewNameUpdateContact(r.name);
            setNewPhoneUpdateContact(r.number);
            setNewConnectionIdUpdateContact(r.connectionId);
            setOpen({ type: "edit" });
          }}
          color="warning"
          variant="contained"
        >
          {r.edit}
        </Button>
      ),
    },
    {
      key: "delete",
      header: "Excluir",
      render: (r: Contact) => (
        <Button
          variant="contained"
          color="error"
          onClick={async () => {
            try {
              setLoadButton(true);
              const ok = confirm(`Deseja excluir "${r.name}"?`);
              if (!ok) return;
              await deleteContact(r.id);
              await fetchContacts(user?.uid);
            } catch (err) {
              console.error("Erro ao excluir:", err);
            } finally {
              setLoadButton(false);
            }
          }}
        >
          {r.delete}
        </Button>
      ),
    },
  ];

  const rows: Contact[] = contacts.map((c) => ({
    id: c.id,
    name: c.data.name,
    number: c.data.number,
    connectionId: c.data.connectionId,
    connectionName:
      connections.find((conn) => conn.id === c.data.connectionId)?.data.name ||
      "",
    edit: "Editar",
    delete: "Excluir",
  }));

  const addContact = async (
    name: string,
    number: string,
    connectionId: string,
  ) => {
    if (!name || !number || !connectionId) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    setLoadButton(true);
    try {
      if (user?.uid) {
        const id = await createContact({
          name,
          number,
          connectionId,
          uid: user.uid,
        });
        console.log("Contact added with ID:", id);
        await fetchContacts(user.uid);
      } else {
        console.error("Não autenticado");
      }
    } catch (err) {
      console.error("Error adding contact:", err);
    } finally {
      setLoadButton(false);
      setNewNameContact("");
      setNewPhoneContact("");
      setNewConnectionIdContact("");
      setOpen({ type: null });
    }
  };

  const addMessage = async (
    title: string,
    text: string,
    contactsId: string[],
    scheduled: boolean,
    sentAt: Date,
  ) => {
    if (!text || !title) {
      alert("Preencha o campo de mensagem e título.");
      return;
    }
    setLoadButton(true);
    try {
      if (user?.uid) {
        const id = await createMessage({
          title,
          text,
          contactsId,
          scheduled,
          sentAt,
          uid: user.uid,
        });
        console.log("Message added with ID:", id);
      } else {
        console.error("Não autenticado");
      }
    } catch (err) {
      console.error("Error adding message:", err);
    } finally {
      setLoadButton(false);
      setOpen({ type: null });
    }
  };

  return (
    <>
      <Modal
        open={open.type === "add"}
        onClose={() => setOpen({ type: null })}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg p-4 rounded min-w-[320px] flex flex-col gap-2">
          <TextField
            label="Nome"
            value={newNameContact}
            required
            onChange={(e) => setNewNameContact(e.target.value)}
            fullWidth
          />
          <TextField
            label="Telefone"
            required
            type="number"
            value={newPhoneContact}
            onChange={(e) => setNewPhoneContact(e.target.value)}
            fullWidth
          />
          <Select
            value={newConnectionIdContact}
            onChange={(e) => setNewConnectionIdContact(e.target.value)}
            required
            fullWidth
          >
            <MenuItem value="1" disabled>
              Selecione
            </MenuItem>
            {connections.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.data.name}
              </MenuItem>
            ))}
          </Select>
          <div className="flex justify-end gap-1">
            <Button
              variant="outlined"
              onClick={() => {
                setNewNameContact("");
                setNewPhoneContact("");
                setOpen({ type: null });
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              loading={loadButton}
              color="primary"
              onClick={async () => {
                await addContact(
                  newNameContact,
                  newPhoneContact,
                  newConnectionIdContact,
                );
              }}
            >
              Adicionar
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        open={open.type === "edit"}
        onClose={() => setOpen({ type: null })}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg p-4 rounded min-w-[320px] flex flex-col gap-2">
          <TextField
            label="Nome"
            value={newNameUpdateContact}
            onChange={(e) => setNewNameUpdateContact(e.target.value)}
            fullWidth
          />
          <TextField
            label="Telefone"
            value={newPhoneUpdateContact}
            onChange={(e) => setNewPhoneUpdateContact(e.target.value)}
            fullWidth
          />
          <Select
            value={newConnectionIdUpdateContact}
            onChange={(e) => setNewConnectionIdUpdateContact(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Nenhuma</MenuItem>
            {connections.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.data.name}
              </MenuItem>
            ))}
          </Select>
          <div className="flex justify-end gap-1">
            <Button
              variant="outlined"
              onClick={() => {
                setNewNameUpdateContact("");
                setNewPhoneUpdateContact("");
                setNewConnectionIdUpdateContact("");
                setOpen({ type: null });
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              loading={loadButton}
              color="primary"
              onClick={async () => {
                if (selectableRow) {
                  setLoadButton(true);
                  await updateContact(selectableRow.id, {
                    name: newNameUpdateContact,
                    number: newPhoneUpdateContact,
                    connectionId: newConnectionIdUpdateContact,
                  });
                  setLoadButton(false);
                  await fetchContacts(user?.uid);
                  setNewNameUpdateContact("");
                  setNewPhoneUpdateContact("");
                  setNewConnectionIdUpdateContact("");
                  setOpen({ type: null });
                }
              }}
            >
              Editar
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        open={open.type === "send"}
        onClose={() => setOpen({ type: null })}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg p-4 rounded min-w-[1020px] flex flex-col gap-2">
          <TextField
            label="Título"
            value={messageToSend.title}
            required
            onChange={(e) =>
              setMessageToSend({ ...messageToSend, title: e.target.value })
            }
            fullWidth
          />
          <TextField
            label="Mensagem"
            value={messageToSend.text}
            required
            onChange={(e) =>
              setMessageToSend({ ...messageToSend, text: e.target.value })
            }
            rows={4}
            multiline
            fullWidth
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={messageToSend.schedule}
                onChange={(e) =>
                  setMessageToSend({
                    ...messageToSend,
                    schedule: e.target.checked,
                  })
                }
              />
            }
            label="Agendar envio"
          />
          {messageToSend.schedule && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Data e hora"
                value={messageToSend.time}
                onChange={(newValue) =>
                  setMessageToSend({ ...messageToSend, time: newValue })
                }
              />
            </LocalizationProvider>
          )}
          <div className="flex justify-end gap-1">
            <Button
              variant="outlined"
              onClick={() => {
                setOpen({ type: null });
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              loading={loadButton}
              color="primary"
              onClick={async () => {
                if (selectedKeys.length > 0) {
                  await addMessage(
                    messageToSend.title,
                    messageToSend.text,
                    selectedKeys as string[],
                    messageToSend.schedule,
                    messageToSend.time
                      ? messageToSend.time.toDate()
                      : new Date(),
                  );
                }
              }}
            >
              {messageToSend.schedule ? "Agendar" : "Enviar"}
            </Button>
          </div>
        </div>
      </Modal>
      <Button
        sx={{ m: 2 }}
        variant="contained"
        color="primary"
        onClick={() => setOpen({ type: "add" })}
      >
        Adicionar
      </Button>
      <Button
        sx={{ m: 2 }}
        variant="contained"
        color="success"
        onClick={() => {
          if (selectedKeys.length > 0) {
            setOpen({ type: "send" });
          } else {
            alert("Selecione ao menos um contato para enviar a mensagem.");
          }
        }}
      >
        Enviar Mensagem
      </Button>

      <BasicTable<Contact>
        rows={rows}
        columns={columns}
        getRowKey={(r) => r.id}
        selectable
        multiSelect
        selectedKeys={selectedKeys}
        onSelectionChange={(selected) =>
          setSelectedKeys(selected.map((s) => s.id))
        }
      />
    </>
  );
}
