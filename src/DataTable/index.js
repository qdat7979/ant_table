import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { Table, Popconfirm, Button, Space, Form, Input, InputNumber } from 'antd';
import {isEmpty} from 'lodash';

const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
    return (
        <td {...restProps}>
            {editing ? (
            <Form.Item
                name={dataIndex}
                style={{
                    margin: 0,
                }}
                rules={[
                {
                    required: true,
                    message: `Please Input ${title}!`,
                },
                ]}
            >
                {inputNode}
            </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};


function DataTable() {
    const [gridData, setGridData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editRowKey, setEditRowKey] = useState("");

    const [form] = Form.useForm();

    useEffect(()=>{
        loadData();
    },[])

    const loadData = async () => {
        setLoading(true);
        const response = await axios.get(`https://jsonplaceholder.typicode.com/comments/`);
        setGridData(response.data);
        setLoading(false);
    }


    const dataWithAge = gridData.map((item) => ({
        ...item,
        age: Math.floor(Math.random() * 6) + 20,
    }))

    const modifiedData = dataWithAge.map(({body,...item})=>(
        {
            ...item,
            key: item.id,
            message: isEmpty(body) ? item.message : body
        }
    ))
    // console.log(modifiedData);

    const handleDelete = (value) => {
        const dataSource = [...modifiedData];
        const filterData = dataSource.filter(item => item.id !== value.id);
        setGridData(filterData);
    }

    const isEditing = (record) => {
        return record.key === editRowKey
    }

    const edit = (record) => {
        console.log(record);
        setEditRowKey(record.key)
    }

    const cancel = () => {
        setEditRowKey('');
    }

    const save = () => {
        
    }

    const columns = [
        {
            title: "ID", 
            dataIndex: "id",
            editable: false
        },
        {
            title: "Name", 
            dataIndex: "name",
            align: "center",
            editable: true,
            render: (text)=> <a>{text}</a>
        },
        {
            title: "Email", 
            dataIndex: "email",
            align: "center",
            editable: true
        },
        {
            title: "Age", 
            dataIndex: "age",
            align: "center",
            editable: false
        },
        {
            title: "Message", 
            dataIndex: "message",
            align: "center",
            editable: true
        },
        {
            title: "Action", 
            dataIndex: "action",
            align: "center", 
            render: (_,record) => {
                // console.log(record)
                const editTable = isEditing(record);
                return (
                    modifiedData.length >= 1 ? (
                        <Space>

                            {/* Delete button */}
                            <Popconfirm 
                                title="Are you sure want to delete ?" 
                                onConfirm={() => handleDelete(record)} 
                                disabled={editRowKey !== ''}
                            >
                                <Button 
                                    danger 
                                    type='primary' 
                                    size='middle' 
                                    disabled={editRowKey !== ''}
                                >
                                    Delete
                                </Button>
                            </Popconfirm>

                            {/* Edit button */}
                            {editTable ? (
                                <Space size={"middle"}>
                                    <Button 
                                        onClick={(e)=> save(record.key)} 
                                        type="primary" 
                                        style={{backgroundColor: '#00FA9A', borderColor:'#00FA9A'}}
                                    >
                                        Save
                                    </Button>

                                    <Popconfirm 
                                        title="Are you sure to cancel" 
                                        onConfirm={cancel}>
                                        <Button>
                                            Cancel
                                        </Button>
                                    </Popconfirm>
                                </Space>
                            ) : (
                                <Button 
                                    disabled={editRowKey !== ''} 
                                    type='primary' 
                                    size='default' 
                                    onClick={()=>{edit(record)}}
                                >
                                    Edit
                                </Button>
                            )}
                        </Space>
                    ):null
                )
            }
        },
    ]

    const mergedColumns = columns.map((col)=>{
        if(!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record) => ({
                record,
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record)
            })
        }
    })

  return (
    <div>
        <h2>DataTable with AntDesign in React</h2>
        <Form form={form} component={false}>
            <Table
                components={{
                    body: {
                        cell: EditableCell,
                    },
                }}
                columns={mergedColumns}
                dataSource={modifiedData}
                bordered
                loading={loading}
            />
        </Form>
    </div>
  )
}

export default DataTable