import {
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
} from "@mui/material";
import BasicTable from "../components/Table";
import { useEffect, useState } from "react";
import { updateMessage, deleteMessage } from "../services/messages";
import { useAuth } from "../hooks/useAuth";
import useMessages from "../hooks/useMessages";
import type { Dayjs } from "dayjs";
import useContacts from "../hooks/useContacts";
import dayjs from "dayjs";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { MessageData } from "../entities/Messages";

type Message = {
  id: string;
  title: string;
  text: string;
  contactIds: string[];
  status: string;
  sentAt: Date | undefined;
  edit: string;
  delete: string;
};

type ModalState = {
  type: "edit" | null;
};

export default function Messages() {
  const { user } = useAuth();
  const [open, setOpen] = useState<ModalState>({ type: null });
  const [messageToSend, setMessageToSend] = useState<{
    title: string;
    text: string;
    time: Dayjs | null;
    schedule: boolean;
    contactIds: string[];
  }>({ title: "", text: "", time: dayjs(), schedule: false, contactIds: [] });
  const [selectableRow, setSelectableRow] = useState<Message | null>(null);
  const [loadButton, setLoadButton] = useState(false);
  const [filteredItem, setFilteredItem] = useState(0);
  const [filteredMessages, setFilteredMessages] = useState<
    {
      id: string;
      data: MessageData;
    }[]
  >([]);
  const { messages, fetchMessages } = useMessages(user?.uid);
  const { contacts } = useContacts(user?.uid);

  const columns = [
    {
      key: "title",
      header: "Título",
      render: (r: Message) => r.title,
      sortable: true,
      accessor: (r: Message) => r.title,
    },
    {
      key: "status",
      header: "Status",
      render: (r: Message) => r.status,
      sortable: true,
      accessor: (r: Message) => r.status,
    },
    {
      key: "sentAt",
      header: "Enviar em",
      render: (r: Message) => (r.sentAt ? r.sentAt.toLocaleString() : ""),
      sortable: true,
      accessor: (r: Message) => r.sentAt,
    },
    {
      key: "edit",
      header: "Editar",
      render: (r: Message) => (
        <Button
          onClick={() => {
            setSelectableRow(r);
            setMessageToSend({
              title: r.title,
              text: r.text,
              contactIds: r.contactIds,
              time: dayjs(r.sentAt),
              schedule: false,
            });
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
      render: (r: Message) => (
        <Button
          variant="contained"
          color="error"
          onClick={async () => {
            try {
              setLoadButton(true);
              const ok = confirm(`Deseja excluir "${r.title}"?`);
              if (!ok) return;
              await deleteMessage(r.id);
              await fetchMessages(user?.uid);
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

  function parseDate(
    value: Date | undefined | { toDate: () => Date },
  ): Date | undefined {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    if (value.toDate) return value.toDate();
    return undefined;
  }

  const rows: Message[] = filteredMessages.map((m) => ({
    id: m.id,
    title: m.data.title,
    text: m.data.text,
    contactIds: m.data.contactsId,
    status:
      m.data.status == "pending"
        ? "Pendente"
        : m.data.status === "sent"
          ? "Enviado"
          : "",
    sentAt: parseDate(m.data.sentAt),
    edit: "Editar",
    delete: "Excluir",
  }));

  useEffect(() => {
    switch (filteredItem) {
      case 0:
        setFilteredMessages(messages);
        break;
      case 1:
        setFilteredMessages(messages.filter((m) => m.data.status === "sent"));
        break;
      case 2:
        setFilteredMessages(messages.filter((m) => m.data.status === "pending"));
        break;
      default:
        break;
    }
  }, [filteredItem, messages]);

  return (
    <>
      <Modal
        open={open.type === "edit"}
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
          <Select
            multiple
            value={messageToSend.contactIds || []}
            onChange={(e) =>
              setMessageToSend((prev) => ({
                ...prev,
                contactIds: e.target.value as string[],
              }))
            }
            fullWidth
          >
            {contacts.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.data.name}
              </MenuItem>
            ))}
          </Select>
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
                if (messageToSend.contactIds.length > 0) {
                  await updateMessage(selectableRow!.id, {
                    title: messageToSend.title,
                    text: messageToSend.text,
                    contactsId: messageToSend.contactIds,
                    scheduled: messageToSend.schedule,
                    sentAt: messageToSend.schedule
                      ? messageToSend.time?.toDate()
                      : new Date(),
                  });
                  await fetchMessages(user?.uid);
                  setOpen({ type: null });
                } else {
                  alert("Selecione pelo menos um contato");
                }
              }}
            >
              Salvar
            </Button>
          </div>
        </div>
      </Modal>
      <Select
        value={filteredItem}
        onChange={(e) => setFilteredItem(e.target.value)}
      >
        <MenuItem value={0}>Todos</MenuItem>
        <MenuItem value={1}>Enviados</MenuItem>
        <MenuItem value={2}>Pendentes</MenuItem>
      </Select>
      <BasicTable<Message>
        rows={rows}
        columns={columns}
        getRowKey={(r) => r.id}
        selectable={false}
        multiSelect={false}
      />
    </>
  );
}
