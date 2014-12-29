import csv
import codecs
import logging
import datetime

def create(session, model, args):
    instance = session.create(model, args)
    return instance
    
def count(session, model):
    count = session.count(model)
    return count

def read(session, model, instanceId):
    instance = session.get(model, instanceId)
    return instance

def update(session, model, instanceId, args):
    instance = session.get(model, instanceId)
    session.update(instance, args)
    return instance

def delete(session, model, instanceId):
    instance = session.get(model, instanceId)
    session.delete(instance.key)

def batch(session, batchDict):
    pass

def csv_import(session, model, csvData):
    logging.info(csvData)
    csvContent = csvData.strip("\r\n")
    #removes the '\xef\xbb\xbf' from the start of the string
    if isinstance(csvContent, str):
        csvContent = csvContent.lstrip(codecs.BOM_UTF8)
    
    #if we export the value and import as it is then its workfine,
    #but if we alter the value in the csv using excel(windows) then its getting changed to unicode
    #even if we check the type(csvContent) its shows as str, but it actually unicode,
    #below code helps to find the unicode char in the content, so that we can encode back to str
    try :
        csvContent.decode("utf-8")
    except UnicodeDecodeError, e:
        logging.warn("received unicode, converting to str")
        csvContent = csvContent.decode("latin-1").encode("utf-8")
    except UnicodeEncodeError, e:
        logging.warn("received str, still throwing UnicodeEncodeError")
        csvContent = csvContent.encode("utf-8")
        
    try:
        csvString = csv.StringIO(csvContent)
        reader = csv.reader(csvString, delimiter=",")
        listReader = list(reader)
        columns = listReader.pop(0)
        for csvRow in listReader:
            count = 0
            args = {}
            for value in csvRow:
                if value:
                    column = columns[count]
                    typeName = model._properties.get(column).__class__.__name__
                    if typeName == "FloatProperty":
                        value = float(value)
                    elif typeName == "DateTimeProperty":
                        value = datetime.datetime.strptime(value, "%Y-%m-%d %H:%M:%S.%f")
                    args[column] = value
                count += 1
            #logging.info(args)
            session.create(model, args)
    except Exception,e:
        logging.exception(e)
        raise

    
def csv_export(session, model):
    results = session.query(model, {})
    toCSV = [result.to_dict() for result in results]
    columns = model._properties.keys()
    
    logging.info(columns)
    csvString = csv.StringIO()
    dict_writer = csv.DictWriter(csvString, columns)
    dict_writer.writer.writerow(columns)
    dict_writer.writerows(toCSV)
    return csvString.getvalue()