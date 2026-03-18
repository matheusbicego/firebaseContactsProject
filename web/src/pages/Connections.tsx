import { Button, Modal, TextField } from "@mui/material";
import BasicTable from "../components/Table";
import { useState } from "react";
import {
  createConnection,
  updateConnection,
  deleteConnection,
  hasLinkedContacts,
} from "../services/connections";
import { useAuth } from "../hooks/useAuth";
import useConnections from "../hooks/useConnections";

type Connection = {
  id: string;
  name: string;
  edit: string;
  delete: string;
};

type ModalState = {
  type: "add" | "edit" | null;
};

export default function Connections() {
  const { user } = useAuth();
  const [open, setOpen] = useState<ModalState>({ type: null });
  const [newNameConnection, setNewNameConnection] = useState("");
  const [newNameUpdateConnection, setNewNameUpdateConnection] = useState("");
  const [selectableRow, setSelectableRow] = useState<Connection | null>(null);
  const [loadButton, setLoadButton] = useState(false);
  const { connections, setConnections, fetchConnections } = useConnections(
    user?.uid,
  );
  const columns = [
    {
      key: "name",
      header: "Nome",
      render: (r: Connection) => r.name,
      sortable: true,
      accessor: (r: Connection) => r.name,
    },
    {
      key: "edit",
      header: "Editar",
      render: (r: Connection) => (
        <Button
          onClick={() => {
            setSelectableRow(r);
            setNewNameUpdateConnection(r.name);
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
      render: (r: Connection) => (
        <Button
          variant="contained"
          color="error"
          onClick={async () => {
            try {
              setLoadButton(true);
              const linked = await hasLinkedContacts(r.id);
              if (linked) {
                alert(
                  "Não é possível excluir: existem contatos vinculados a essa conexão.",
                );
                return;
              }
              const ok = confirm(`Deseja excluir "${r.name}"?`);
              if (!ok) return;
              await deleteConnection(r.id);
              await fetchConnections(user?.uid);
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

  const rows: Connection[] = connections.map((c) => ({
    id: c.id,
    name: c.data.name,
    edit: "Editar",
    delete: "Excluir",
  }));

  const addConnection = async (name: string) => {
    setLoadButton(true);
    if (!name) {
      alert("Preencha o nome da conexão.");
      setLoadButton(false);
      return;
    }
    try {
      if (user?.uid) {
        const id = await createConnection({ name, uid: user.uid });
        console.log("Connection added with ID:", id);
        await fetchConnections(user.uid);
      } else {
        console.error("Não autenticado");
      }
    } catch (err) {
      console.error("Error adding connection:", err);
    } finally {
      setLoadButton(false);
      setNewNameConnection("");
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
            value={newNameConnection}
            onChange={(e) => setNewNameConnection(e.target.value)}
            fullWidth
          />
          <div className="flex justify-end gap-1">
            <Button
              variant="outlined"
              onClick={() => {
                setNewNameConnection("");
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
                await addConnection(newNameConnection);
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
            value={newNameUpdateConnection}
            onChange={(e) => setNewNameUpdateConnection(e.target.value)}
            fullWidth
          />
          <div className="flex justify-end gap-1">
            <Button
              variant="outlined"
              onClick={() => {
                setNewNameUpdateConnection("");
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
                  await updateConnection(selectableRow.id, {
                    name: newNameUpdateConnection,
                  });
                  setLoadButton(false);
                  await fetchConnections(user?.uid);
                  setNewNameUpdateConnection("");
                  setOpen({ type: null });
                }
              }}
            >
              Editar
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

      <BasicTable<Connection>
        rows={rows}
        columns={columns}
        getRowKey={(r) => r.id}
        selectable={false}
        multiSelect={false}
      />
    </>
  );
}
