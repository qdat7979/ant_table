import React, { useState, useEffect, useRef } from 'react';
import {Space, Table, Button, Popconfirm, Form, Input, InputNumber } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import axios from 'axios';



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
    // console.log(editing);
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

const Index = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [editingKey, setEditingKey] = useState('')

    const [form] = Form.useForm();

    // search 
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };
    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div
                style={{
                padding: 8,
                }}
            >
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                        width: 90,
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{
                        width: 90,
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({
                                closeDropdown: false,
                            });
                            setSearchText(selectedKeys[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                        close();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),

        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                color: filtered ? '#1890ff' : undefined,
                }}
            />
        ),

        onFilter: (value, record) =>
        record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),

        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },

        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                highlightStyle={{
                    backgroundColor: '#ffc069',
                    padding: 0,
                }}
                searchWords={[searchText]}
                autoEscape
                textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    useEffect(()=>{
        loadData();
    },[])

    // handle load 
    const loadData = async () => {
        setLoading(true);
        const response = await axios.get(`https://jsonplaceholder.typicode.com/comments/`);
        setData(response.data);
        setLoading(false);
    }

    // handle save
    const save = async (key) => {
        try {
          const row = await form.validateFields();
          const newData = [...data];
          const index = newData.findIndex((item) => key === item.id);
          console.log(index);
          if (index > -1) {
            const item = newData[index];
            console.log(item)
            newData.splice(index, 1, {
              ...item,
              ...row,
            });
            setData(newData);
            setEditingKey('');
          } else {
            newData.push(row);
            setData(newData);
            setEditingKey('');
          }
        } catch (errInfo) {
          console.log('Validate Failed:', errInfo);
        }
      };
    
    // handle delete
    const handleDelete = (record) => { 
        console.log(record.id)
        const newData = [...data];
        const filterData =  newData.filter(item => item.id !== record.id)
        setData(filterData);  
    }

    // handle edit
    const edit = (record) => {
        setEditingKey(record.id)
        form.setFieldsValue(
            {   
                name:"",
                email:"",
                comment:"",
                ...record
            }
        );
    }

    const isEditing = (record) => {
        return record.id === editingKey;
    }

    // handle cancel
    const cancel = () => {
        setEditingKey('')
    }

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 50,
            sorter: (a, b) => a.id - b.id,
            defaultSortOrder: 'ascend',
            fixed: 'left',
            editable: false,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: '15%',
            render: (text) => <a>{text}</a>,
            editable: true,
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: '15%',
            filters: [
                {
                    text: '@gardner.biz',
                    value: '@gardner.biz'
                },
                {
                    text: '@sydney.com',
                    value: '@sydney.com'
                }
            ],
            onFilter: (value, record) => record.email.includes(value),
            editable: true,
        },
        {
            title: 'Comment',
            dataIndex: 'body',
            key: 'comment',
            sorter: (a, b) => a.body.length - b.body.length,
            width: '35%',  
            editable: true,
        },
        {
            title: 'Action',
            key: 'action',
            render: (_,record)=> {
                const editable = isEditing(record);
                return (
                    <Space>
                        <Button 
                            danger 
                            onClick={()=>{handleDelete(record)}}
                            disabled = {editingKey !== ''}
                        >
                            Delete
                        </Button>

                        {   editable ? (
                            <>
                                <Button
                                    type='primary'
                                    onClick={()=>{save(record.id)}}
                                >
                                    Save
                                </Button>

                                <Popconfirm title="You really want to cancel?" onConfirm={cancel}>
                                    <Button
                                    >
                                        Cancel
                                    </Button>
                                </Popconfirm>
                            </>
                            ):( 
                                <Button 
                                    disabled = {editingKey !== ''}
                                    onClick={()=>{edit(record)}}> 
                                    Edit
                                </Button>
                            )
                        }
                    </Space>
                )
            }
        }
    ]

    // convert columns into mergedColumns to pass in props
    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
          return col;
        }
        return {
          ...col,
          onCell: (record) => {
            // console.log(record);
            return {
                record,
                inputType: col.dataIndex === 'age' ? 'number' : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }
          },
        };
    });
    
  return (
    <div>
        <h1>Data Table</h1>
        <Form form={form} component={false}>
            <Table
                components={
                    {
                        body: {
                            cell: EditableCell
                        }
                    }
                }
                columns={mergedColumns}
                dataSource = {data}
                bordered
                pagination={{
                    pageSize: 50,
                }}
                scroll={{
                    y: 240,
                    x: 1000
                }}
                loading={loading}
            ></Table>
        </Form>
    </div>
  )
}

export default Index