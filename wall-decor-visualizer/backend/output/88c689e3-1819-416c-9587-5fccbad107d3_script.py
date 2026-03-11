OUTPUT_PATH = '/tmp/88c689e3-1819-416c-9587-5fccbad107d3.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Dimensions used (in feet):
    - Total Height: 9'
    - Opening Height: 8'
    - Lintel Height (above opening): 1'
    - Opening Width: 7'
    - Right Wall Width: 7'6" (7.5')
    - Total Width: 14.5'
    """
    
    # Clear existing objects in the scene
    if bpy.context.active_object and bpy.context.active_object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Wall thickness (standard assumption: 0.5 feet or 6 inches)
    thickness = 0.5

    # 1. Right Solid Wall Segment
    # Width: 7.5', Height: 9'
    # Position: Starts at X=7', ends at X=14.5'
    # Center X = 7 + (7.5 / 2) = 10.75
    # Center Z = 9 / 2 = 4.5
    bpy.ops.mesh.primitive_cube_add(size=1, location=(10.75, 0, 4.5))
    right_wall = bpy.context.active_object
    right_wall.name = "Wall_Right_Segment"
    right_wall.scale = (7.5, thickness, 9.0)

    # 2. Top Wall Segment (Lintel area above the door/AC opening)
    # Width: 7', Height: 1'
    # Position: Starts at X=0, ends at X=7', starts at Z=8' (above the 8' opening)
    # Center X = 7 / 2 = 3.5
    # Center Z = 8 + (1 / 2) = 8.5
    bpy.ops.mesh.primitive_cube_add(size=1, location=(3.5, 0, 8.5))
    top_wall = bpy.context.active_object
    top_wall.name = "Wall_Top_Segment"
    top_wall.scale = (7.0, thickness, 1.0)

    # Apply scale to all objects to ensure correct geometry representation
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # Export the reconstructed skeleton to GLB format
    # filepath is set to 'wall_skeleton.glb' for headless execution output
    bpy.ops.export_scene.gltf(
        filepath='/tmp/88c689e3-1819-416c-9587-5fccbad107d3.glb', 
        export_format='GLB', 
        use_selection=False
    )

# Execute the function directly
create_wall_skeleton()